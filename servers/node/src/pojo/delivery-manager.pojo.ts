import uuid from 'uuid/v4';
import { Subject } from 'rxjs';

import { MessageConfigMap } from './message-config.map';
import { ConsumerConnection } from './consumer-connection.pojo';
import { SocketHandlingUtil } from '../utils/socket-handling.util';
import { MessageStoreService } from '../interfaces/message-store-service.interface';
import { MessageState } from '../enums/message-state.enum';
import { ProgrammingError } from '../errors/programming.error';

/**
 * This class has the mission to manage the delivery of messages
 *
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 * @since 1.0.0
 * @export
 * @class DeliveryManager
 */
export class DeliveryManager {
    private _messagesReady: Subject<MessageConfigMap> = new Subject();
    private _isInit = false;

    /**
     * Creates an instance of DeliveryManager. <br>
     * <b>NOTICE:</b>Has strong logic... constructors should not... but this project is a POO for now
     * 
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @param {ConsumerConnection} _consumerConnection
     */
    public constructor(private _consumerConnection: ConsumerConnection, private _messageStoreService: MessageStoreService) {

    }


    /**
     * Starts the manager
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @returns {Promise<void>}
     */
    public async init(): Promise<void> {
        await this._messageStoreService.init();
        await this._addTimeouts();
        this._addResetAckCommand();
        this._consumerConnection.onPendingMessagesObservable(_ => {
            setTimeout(async () => {
                const pendingObserver: Map<string, MessageConfigMap> = await this._messageStoreService.findByPendingObserver(1);
                if (pendingObserver.size) {
                    const [id, message]: [string, MessageConfigMap] = pendingObserver.entries().next().value;
                    console.log(`Invoking .next() on message with id ${id}`);
                    this._messageStoreService.updateStatus(id, MessageState.READY_TO_DELIVER);
                    this._messagesReady.next(message);
                }
            });
            return this._messagesReady.asObservable();
        }).onMessageEmitted(async (message, hasAck) => {
            if (!hasAck) {
                this._messageStoreService.updateStatus(message.get('ID'), MessageState.NOT_WANTING_TO_ACK);
            } else {
                this._messageStoreService.doMarkAsDelivered(message.get('ID'));
            }

        }).onConsumerDefinition(async () => {
            await this._resetAck();
        }).onSocketClose(async () => {
            await this._resetAck();
        }).onMessageSend((session, message) => new Promise(resolve => {
            session.socket.write(`${message.get('BODY')}\r\n`, () => resolve());
        }));
        this._isInit = true;
    }

    /**
     * Adds a message and delivers it, when possible 
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param {MessageConfigMap} message
     * @returns {string}
     */
    public async addMessage(message: MessageConfigMap): Promise<string> {
        if (!this._isInit) {
            throw new ProgrammingError('Looks like the noobie programmer, didn\' invoke .init()');
        }
        const id: string = uuid();
        message.set('ID', id);
        const deliverTime: number = message.get('DELIVER_DATE')
            ? this._getTimeDifference(new Date(message.get('DELIVER_DATE')))
            : +message.get('DELIVER_TIMESTAMP');
        message.set('EMISION_STATE', MessageState.PENDING_DELIVER);
        await this._messageStoreService.saveMessage(message);
        setTimeout(() => this._doDeliverOnTime(id, message), isNaN(deliverTime) ? 0 : deliverTime);
        console.log(`Added message ${id}`);
        return id;
    }

    private _addResetAckCommand(): void {
        SocketHandlingUtil.addCommand('RESET_ACK', async session => {
            if (session.role === 'CONSUMER' && session.sectionName === 'GET_MESSAGE') {
                await SocketHandlingUtil.asyncWrite(session.socket, 'ERROR: Can NOT run this command inside GET_MESSAGE section\r\n');
            } else if (session.role !== 'CONSUMER') {
                await SocketHandlingUtil.asyncWrite(session.socket, 'ERROR: You are not a consumer\r\n')
            } else {
                this._resetAck();
                await SocketHandlingUtil.asyncWrite(session.socket, 'OK\r\n');
            }
        });
    }

    private async _doDeliverOnTime(id: string, message: MessageConfigMap): Promise<void> {
        console.log(`Delivering message with id ${id}, body: ${message.get('BODY')}`);
        message.set('EMISION_STATE', MessageState.READY_TO_DELIVER);
        if (this._messagesReady.observers.length) {
            await this._messageStoreService.updateStatus(id, MessageState.READY_TO_DELIVER);
            this._messagesReady.next(message);
        } else {
            await this._messageStoreService.updateStatus(id, MessageState.PENDING_OBSERVER);
        }
    }

    private _getTimeDifference(date: Date): number {
        return date.getTime() - new Date().getTime();
    }

    private async _resetAck(): Promise<void> {
        const messages = await this._messageStoreService.findByStatus(MessageState.NOT_WANTING_TO_ACK);
        const uuids = Array.from(messages.values()).map(current => current.get('ID'));
        await this._messageStoreService.updateStatus(uuids, MessageState.PENDING_OBSERVER);
    }

    private async _addTimeouts(): Promise<void> {
        let itResult: IteratorResult<MessageConfigMap>;
        const it: IterableIterator<MessageConfigMap> = (await this._messageStoreService.findAll()).values();
        while ((itResult = it.next()) && !itResult.done) {
            const current: MessageConfigMap = itResult.value;
            const pendingMillis: number = this._calculatePendingMillis(current);
            if (pendingMillis < 0) {
                await this._doDeliverOnTime(current.get('ID'), current);
                current.set('EMISION_STATE', MessageState.PENDING_OBSERVER);
            } else {
                current.set('EMISION_STATE', MessageState.PENDING_DELIVER);
                setTimeout(() => this._doDeliverOnTime(current.get('ID'), current), pendingMillis);
            }
            await this._messageStoreService.saveMessage(current)
        };
    }

    private _calculatePendingMillis(message: MessageConfigMap): number {
        const now: number = new Date().getTime();
        return message.get('DELIVER_DATE')
            ? message.get('DELIVER_DATE').getTime() - now
            : message.get('DELIVER_TIMESTAMP') + message.get('CREATED_AT').getTime() - now;
    }
}
