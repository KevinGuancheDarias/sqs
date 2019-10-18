import { MessageConfigMap } from '../pojo/message-config.map';
import { MessageState } from '../enums/message-state.enum';

type MessagesMap = Map<string, MessageConfigMap>;

/**
 * Represents the storage of messsages and fetching
 *
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 * @since 1.0.0
 * @export
 * @interface MessageStoreService
 */
export interface MessageStoreService {

    /**
     * Inits the service
     * 
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     */
    init(): Promise<void>;

    /**
     * Finds all the messages in the database
     * 
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     */
    findAll(): Promise<MessagesMap>;

    /**
     * Finds one message
     * 
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param uuid 
     * @returns The instance, or null if not found
     */
    findOne(uuid: string): Promise<MessageConfigMap>;

    /**
     * Finds messages by pending observer state
     * 
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param [limit] Max number of rows, if not specified, will be unlimited
     * @returns
     */
    findByPendingObserver(limit?: number): Promise<MessagesMap>;

    /**
     * Finds messages with specified state
     * 
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param status The status to search for
     * @param [limit] Max number of rows, if not specified, will be unlimited
     * @returns
     */
    findByStatus(status: MessageState, limit?: number): Promise<MessagesMap>;

    /**
     * Saves message
     * 
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param messageMap The message map object 
     */
    saveMessage(messageMap: MessageConfigMap): Promise<void>;

    /**
     * Updates the state of multiple messages
     * 
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param uuid 
     * @param state The new state
     */
    updateStatus(uuids: string[], state: MessageState): Promise<MessagesMap>;

    /**
     * Updates the state of a message
     * 
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param uuid 
     * @param state The new state
     */
    updateStatus(uuid: string, state: MessageState): Promise<MessageConfigMap>;

    /**
     * Removes the pending observer state, and adds ready to deliver state
     * 
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param uuid 
     */

    doRemovePendingObserver(uuid: string): Promise<void>;

    /**
     * Defines the ACK state of a message
     * 
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param uuid 
     * @param value
     */
    markAck(uuid: string, value: boolean): Promise<void>;

    /**
     * Marks a message as delivered
     * 
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param uuid 
     */
    doMarkAsDelivered(uuid: string): Promise<void>;

    /**
     * Marks all messages that were send but marked as not ACK, to be ready to deliver again
     * 
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @returns All the messages that are ready to deliver
     */
    doResetAckAndFind(): Promise<MessagesMap>;
}