
/**
 * Represents the current stated of a TCP session between two peers
 *
 * @todo Research if it's potentially unuseful
 * @since 1.0.0
 * @export
 * @enum {number}
 */
export enum State {

    /**
     * Represents that we are out of any scope
     */
    ROOT,

    /**
     * Represents the config scope which accepts STRING=VALUE properties
     */
    CONFIG,

    /**
     * Represents the exchange of JSON
     */
    DATA,

    /**
     * We are in the producer's root
     */
    PRODUCER_ROOT
}