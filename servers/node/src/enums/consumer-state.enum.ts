
/**
 * Represents the states that a consumer can have
 *
 * @export
 * @enum {number}
 */
export enum ConsumerState {

    /**
     * The consumer is not connected.. obviously..
     */
    NOT_CONNECTED,

    /**
     * The consumer has issued a START_GET_MESSAGE, and is not in END_GET_MESSAGE
     */
    WANTING_MESSAGES,

    /**
     * The consumer has issued a START_METADATA
     */
    WRITING_METADATA,

    /**
     * The consumer is not doing anything known to the protocol
     */
    BLOCKING
}