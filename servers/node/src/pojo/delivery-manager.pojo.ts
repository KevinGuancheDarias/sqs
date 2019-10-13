import uuid from 'uuid/v4';
import { Subject } from 'rxjs';

import { MessageConfigMap } from './message-config.map';
import { ConsumerConnection } from './consumer-connection.pojo';
import { SocketHandlingUtil } from '../utils/socket-handling.util';

/**
 * This class has the mission to manage the delivery of messages
 *
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 * @since 1.0.0
 * @export
 * @class DeliveryManager
 */
export class DeliveryManager {
    private _delayedStore: Map<string, MessageConfigMap> = new Map();
    private _messagesReady: Subject<MessageConfigMap> = new Subject();
    private _undeliveredStore: Map<string, MessageConfigMap> = new Map();
    private _notWantingToAckMessages: Map<string, MessageConfigMap> = new Map();
    private _pendingObserver: Map<string, MessageConfigMap> = new Map();


    /**
     * Creates an instance of DeliveryManager. <br>
     * <b>NOTICE:</b>Has strong logic... constructors should not... but this project is a POO for now
     * 
     * @todo Remove logic from constructor, and review the tsdoc of this method
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @param {ConsumerConnection} _consumerConnection
     */
    public constructor(private _consumerConnection: ConsumerConnection) {
        this._addResetAckCommand();
        this._consumerConnection.onPendingMessagesObservable(_ => {
            setTimeout(() => {
                if (this._pendingObserver.size) {
                    const [id, message] = this._pendingObserver.entries().next().value;
                    console.log(`Invoking .next() on message with id ${id}`);
                    this._pendingObserver.delete(id);
                    this._messagesReady.next(message);
                }
            });
            return this._messagesReady.asObservable();
        }).onMessageEmitted(async (message, hasAck) => {
            this._undeliveredStore.delete(message.get('ID'));
            if (!hasAck) {
                this._notWantingToAckMessages.set(message.get('ID'), message);
            }
        }).onConsumerDefinition(async () => {
            this._resetAck();
        }).onSocketClose(() => this._notWantingToAckMessages.forEach((message, key) => {
            this._undeliveredStore.set(message.get('ID'), message);
        })).onMessageSend((session, message) => new Promise(resolve => {
            session.socket.write(`${message.get('BODY')}\r\n`, () => resolve());
        }));
    }

    /**
     * Adds a message and delivers it, when possible 
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param {MessageConfigMap} message
     * @returns {string}
     */
    public addMessage(message: MessageConfigMap): string {
        const id: string = uuid();
        message.set('ID', id);
        this._delayedStore.set(id, message);
        const deliverTime: number = message.get('DELIVER_DATE')
            ? this._getTimeDifference(new Date(message.get('DELIVER_DATE')))
            : +message.get('DELIVER_TIMESTAMP');
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

    private _doDeliverOnTime(id: string, message: MessageConfigMap): void {
        console.log(`Delivering message with id ${id}, body: ${message.get('BODY')}`);
        this._delayedStore.delete(id);
        if (this._messagesReady.observers.length) {
            this._messagesReady.next(message);
        } else {
            this._pendingObserver.set(id, message);
        }
        this._undeliveredStore.set(id, message);
    }

    private _getTimeDifference(date: Date): number {
        return date.getTime() - new Date().getTime();
    }

    private _resetAck(): void {
        this._undeliveredStore.forEach((value, key) => {
            this._pendingObserver.set(key, value);
        });
        this._notWantingToAckMessages.forEach((value, key) => {
            this._pendingObserver.set(key, value);
        });
    }
}
