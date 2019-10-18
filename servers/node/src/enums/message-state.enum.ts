/**
 * Represents the states a message can have
 *
 * @since 1.0.0
 * @export
 * @enum {number}
 */
export enum MessageState {

    /**
     * Time to deliver is pending
     */
    PENDING_DELIVER,

    /**
     * Is ready to deliver, but observer (consumer) is not connected, or is not wanting messages
     */
    PENDING_OBSERVER,

    /**
     * Client doesn't want to mark the receive message as ACK
     */
    NOT_WANTING_TO_ACK,

    /**
     * The message is ready to deliver to a connected consumer, but it's queued-up
     */
    READY_TO_DELIVER
}
