import { createServer, Server, Socket } from 'net';
import { EnvironmentUtil } from './utils/environment.util';
import { SessionConfigMap } from './pojo/session-config.map';
import { ProgrammingError } from './errors/programming.error';
import { ParamsUtil } from './utils/params.util';
import { SectionState } from './enums/section-state.enum';
import { MessageConfigMap } from './pojo/message-config.map';
import { DeliveryManager } from './pojo/delivery-manager.pojo';
import { ConsumerConnection } from './pojo/consumer-connection.pojo';
import { SocketHandlingUtil } from './utils/socket-handling.util';
import { AbortSessionError } from './errors/abort-session.error';

/**
 * Creates a server and listens for messages
 *
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 * @since 1.0.0
 * @export
 * @class Server
 */
export class SimpleQueueServer {

    private _server: Server;
    private _consumerConnection: ConsumerConnection = new ConsumerConnection();
    private _deliveryManager: DeliveryManager = new DeliveryManager(this._consumerConnection);

    /**
     * Inits the server
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     */
    public init(): void {
        this._addCommands();
        this._server = createServer(async socket => {
            socket.write('HELO SERVER\r\n');
            socket.setEncoding('utf8');
            const sessionConfig: SessionConfigMap = await this._waitConfiguration(socket, new SessionConfigMap());
            try {
                while (1) {
                    await this._configureSession(socket, sessionConfig);
                }
            } catch (e) {
                if (e instanceof AbortSessionError) {
                    await SocketHandlingUtil.asyncWrite(socket, `ERROR: ${e.message}`);
                }
            }
            await (() => new Promise(resolve => setTimeout(resolve, 10000)))();
            socket.destroy();
        })
        this._server.listen(EnvironmentUtil.findEnvVarOrDie('SQS_PORT'), +EnvironmentUtil.findEnvVarOrDie('SQS_HOST'));
    }

    private async _waitConfiguration(socket: Socket, sessionConfig: SessionConfigMap): Promise<SessionConfigMap> {
        await SocketHandlingUtil.handleSection('CONFIG', {
            socket,
            buffer: '',
            sectionState: SectionState.WAIT_OPEN,
            sectionMap: sessionConfig,
            isHandlable: async session => await ParamsUtil.isParamsBuffer(session.buffer),
            handleRegularInput: async session =>
                ParamsUtil.handleParams(session, sessionConfig, (key, value) => sessionConfig.isAssignable(key, value)),
            onEndSection: async _ => {
                return (sessionConfig.get('QUEUE') && sessionConfig.get('ROLE')) ? '' : 'Missing configuration';
            }
        });
        return sessionConfig;
    }

    private async _configureSession(socket: Socket, sessionConfig: SessionConfigMap): Promise<void> {
        const role: string = sessionConfig.get('ROLE');
        if (role === 'PRODUCER') {
            console.log('Configuring producer :O ');
            await this._configureProducer(socket, sessionConfig);
        } else if (role === 'CONSUMER') {
            await this._consumerConnection.defineConsumerSocket(socket, sessionConfig);
        } else {
            throw new ProgrammingError('Should never accept an invalid ROLE, as of this exception, valid values were: PRODUCER and CONSUMER');
        }
    }

    private async _configureProducer(socket: Socket, sessionConfig: SessionConfigMap): Promise<void> {
        const messageConfig: MessageConfigMap = new MessageConfigMap();
        await SocketHandlingUtil.handleSection('METADATA', {
            socket,
            buffer: '',
            sessionConfig,
            role: 'PRODUCER',
            sectionState: SectionState.WAIT_OPEN,
            sectionMap: messageConfig,
            isHandlable: async session => await ParamsUtil.isParamsBuffer(session.buffer),
            handleRegularInput: async session =>
                ParamsUtil.handleParams(session, messageConfig, (key, value) =>
                    !messageConfig.isServerProperty(<any>key)
                    && messageConfig.isAssignable(key, value)
                    && (key !== 'DELIVER_DATE' || this._isValidDate(value))
                ),
            onEndSection: async _ =>
                messageConfig.get('DELIVER_DATE') || messageConfig.get('DELIVER_TIMESTAMP')
                    ? (
                        messageConfig.get('DELIVER_DATE') && messageConfig.get('DELIVER_TIMESTAMP')
                            ? 'Can NOT specify both DELIVER_DATE and DELIVER_TIMESTAMP'
                            : ''
                    )
                    : 'Missing DELIVER_DATE or DELIVER_TIMESTAMP'

        });
        await SocketHandlingUtil.handleSection('MESSAGE', {
            socket,
            buffer: '',
            sessionConfig,
            role: 'PRODUCER',
            sectionState: SectionState.WAIT_OPEN,
            sectionMap: messageConfig,
            isHandlable: async _ => true,
            handleRegularInput: async session => session.buffer,
            onEndSection: async session => {
                try {
                    JSON.parse(session.buffer);
                    messageConfig.set('BODY', session.buffer);
                    this._deliveryManager.addMessage(messageConfig);
                    return '';
                } catch (e) {
                    console.error(e);
                    return 'Invalid JSON was specified';
                }
            }
        })
    }

    private _isValidDate(input: string) {
        const valueAsNum = parseInt(input);
        const date = new Date(isNaN(valueAsNum) ? input : valueAsNum);
        return !isNaN(date.getTime());
    }

    private _addCommands(): void {
        SocketHandlingUtil.addCommand('QUIT', async (session) => {
            await SocketHandlingUtil.asyncWrite(session.socket, 'OK\r\n');
            session.socket.destroy();
        });
    }
}