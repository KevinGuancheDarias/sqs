
/**
 * Represents the current TCP session state in a section
 *
 * @export
 * @enum {number}
 */
export enum SectionState {

    /**
     * We are waiting the client peer to issue a START_SECTION, where _SECTION may be any accepted section, for example: START_CONFIG, START_METADATA
     */
    WAIT_OPEN,

    /**
     * We are accepting input for a specific section, or a special call to END_SECTION, where _SECTION may be any accepted section, for example: START_CONFIG, START_METADATA
     */
    ACCEPT_INPUT
}