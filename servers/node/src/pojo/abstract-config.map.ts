import { ProgrammingError } from '../errors/programming.error';

/**
 * Used to have maps that can have only specified keys
 *
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 * @since 1.0.0
 * @export
 * @abstract
 * @class AbstractConfigMap
 * @extends {Map<K, T>}
 * @template K type of map key
 * @template V type of map value
 */
export abstract class AbstractConfigMap<K extends string, V extends string> extends Map<K, V> {
    /**
     * Returns the supported vars by the map
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @abstract
     * @returns {Map<K, V>}
     */
    protected abstract getSupportedVars(): Map<K, string[]>;

    /**
     * Returns true if the variable is a valid env var
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param {string} key
     * @returns
     */
    public isAssignable(key: string, value: V): boolean {
        const entry: string[] | undefined = this.getSupportedVars().get(<any>key);
        return !!entry && (entry.length === 0 || entry.some(current => current === value));
    }

    /**
     * Sets a entry
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param {K} key
     * @param {V} value
     * @returns {this}
     */
    public set(key: K, value: V): this {
        if (!this.isAssignable(key, value)) {
            throw new ProgrammingError(
                `Before you invoke SessionConfig.set() you should make sure, that the key is a "Assignable", passed key ${key}
            `);
        }
        return super.set(key, value);
    }

    /**
     * Formats as a string the supported values for the map. Ex: To use in GET_HELP
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @returns {string}
     */
    public supportedToString(): string {
        let retVal = '';
        this.getSupportedVars().forEach((values, key) => {
            retVal += `\r\n--------\r\n${key}=${values.length ? values.join('|') : '<any value>'}`;
        });
        return retVal;
    }
}