import { ConfigurationError } from '../errors/configuration.error';

/**
 * Has methods for handling the config
 *
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 * @since 1.0.0
 * @export
 * @class EnvironmentUtil
 */
export class EnvironmentUtil {


    public static findEnvVarOrDie(name: string): string;

    /**
     * Finds a environment variable or dies if not found
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param {string} name
     * @param {boolean} [isNumeric=false]
     * @returns {(number | string)}
     */
    public static findEnvVarOrDie(name: string): number | string {
        let val = process.env[name];
        if (!val) {
            throw new ConfigurationError(`Environment variable ${name} has not been passed`);
        } else {
            return val;
        }
    }

    private constructor() {
        // An util class can't have visible constructor
    }
}