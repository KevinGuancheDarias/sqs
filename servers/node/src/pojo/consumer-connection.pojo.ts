import { Socket } from 'net';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { ConsumerState } from '../enums/consumer-state.enum';
import { ConsumerAlreadyConnectedError } from '../errors/consumer-already-connected.error';
import { SocketHandlingUtil } from '../utils/socket-handling.util';
import { SectionState } from '../enums/section-state.enum';
import { ParamsUtil } from '../utils/params.util';
import { MessageConfigMap } from './message-config.map';
import { ProgrammingError } from '../errors/programming.error';
import { TcpSession } from '../types/tcp-session.type';
import { SessionConfigMap } from './session-config.map';

type PendingMessagesHandlerFunction = (tcpSession: TcpSession) => Observable<MessageConfigMap>
type MessageSendHandlerFunction = (tcpSession: TcpSession, message: MessageConfigMap) => Promise<void>
type EmittedHandlerFunction = (message: MessageConfigMap, hasAck: boolean) => Promise<void>;


/**
 * Represents the connected consumer
 *
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 * @since 1.0.0
 * @export
 * @class ConsumerConnection
 */
export class ConsumerConnection {
    private _consumerSocket: Socket;
    private _sessionConfig: SessionConfigMap;
    private _consumerState: ConsumerState = ConsumerState.NOT_CONNECTED;
    private _onMessageSend: MessageSendHandlerFunction;
    private _pendingMessagesHandler: PendingMessagesHandlerFunction;
    private _onMessageEmitted: EmittedHandlerFunction[] = [];
    private _onConsumerDefinition: () => Promise<void>;
    private _onSocketClose: Function;


    /**
     *
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @returns {Socket}
     */
    public getConsumerSocket(): Socket {
        return this._consumerSocket;
    }


    /**
     * Defines the consumer socket
     *
     * @throws {ConsumerAlreadyConnectedError} When there is already a consumer socket
     * @throws {ProgrammingError} As always when the programmer is noob
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param {Socket} socket
     * @param {SessionConfigMap} sessionConfig
     * @returns {Promise<void>}
     */
    public async defineConsumerSocket(socket: Socket, sessionConfig: SessionConfigMap): Promise<void> {
        if (this._consumerState !== ConsumerState.NOT_CONNECTED) {
            throw new ConsumerAlreadyConnectedError('There is already a consumer connected');
        }
        if (!this._pendingMessagesHandler) {
            throw new ProgrammingError('Should first define the observable of pending messages');
        }

        this._consumerSocket = socket;
        this._sessionConfig = sessionConfig;
        this._consumerState = ConsumerState.BLOCKING;
        this._onConsumerDefinition && await this._onConsumerDefinition();
        await this._handleSocketExchange();
    }


    /**
     * Action to run to fetch the pending messages Observable
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param {PendingMessagesHandlerFunction} handler
     * @returns {this}
     */
    public onPendingMessagesObservable(handler: PendingMessagesHandlerFunction): this {
        this._pendingMessagesHandler = handler;
        return this;
    }

    /**
     * Action to run when we are about to send a message to the client (can be used to transform the message and more)
     * 
     * @param handler 
     */
    public onMessageSend(handler: MessageSendHandlerFunction): this {
        if (this._onMessageSend) {
            console.warn('Overring handler for MessageSend event');
        }
        this._onMessageSend = handler;
        return this;
    }


    /**
     * Action to run when the Consumer has been defined
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param {() => Promise<void>} handler
     * @returns {this}
     */
    public onConsumerDefinition(handler: () => Promise<void>): this {
        this._onConsumerDefinition = handler;
        return this;
    }


    /**
     * Action to run when the message has been emitted with success
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param {EmittedHandlerFunction} handler
     * @returns {this}
     */
    public onMessageEmitted(handler: EmittedHandlerFunction): this {
        this._onMessageEmitted.push(handler);
        return this;
    }


    /**
     * Action to run when the consumer closes the connection
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param {Function} handler
     * @returns {this}
     */
    public onSocketClose(handler: Function): this {
        this._onSocketClose = handler;
        return this;
    }

    private async _handleSocketExchange(): Promise<void> {
        const ackMap: Map<string, string> = new Map();
        let message: MessageConfigMap;
        this._consumerSocket.on('close', () => {
            this._consumerSocket = null;
            this._consumerState = ConsumerState.NOT_CONNECTED;
            this._onSocketClose();
        });
        while (1) {
            console.log('Listening to GET_MESSAGE queries');
            await SocketHandlingUtil.handleSection('GET_MESSAGE', {
                socket: this._consumerSocket,
                buffer: '',
                sectionState: SectionState.WAIT_OPEN,
                sessionConfig: this._sessionConfig,
                role: 'CONSUMER',
                onStartSection: async session => {
                    this._consumerState = ConsumerState.WANTING_MESSAGES;
                    message = await this._pendingMessagesHandler(session).pipe(take(1)).toPromise();
                    await this._onMessageSend(session, message);
                },
                isHandlable: async session => await ParamsUtil.isParamsBuffer(session.buffer),
                handleRegularInput: async session =>
                    ParamsUtil.handleParams(session, ackMap),
                onEndSection: async _ => {
                    await Promise.all(this._onMessageEmitted.map(async current => await current(message, ackMap.get('ACK') !== 'FALSE')));
                    this._consumerState = ConsumerState.BLOCKING;
                    return '';
                }
            });
        }
    }
}