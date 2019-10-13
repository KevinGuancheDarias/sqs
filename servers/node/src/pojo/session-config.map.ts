import { AbstractConfigMap } from './abstract-config.map';

type supportedVars = 'QUEUE' | 'ROLE';

/**
 * Contains the config for the current TCP session between two peers
 *
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 * @since 1.0.0
 * @export
 * @class SessionConfigMap
 * @extends {Map<supportedVars, any>}
 */
export class SessionConfigMap extends AbstractConfigMap<supportedVars, any> {
    protected getSupportedVars(): Map<supportedVars, string[]> {
        return new Map<supportedVars, string[]>()
            .set('QUEUE', [])
            .set('ROLE', ['PRODUCER', 'CONSUMER']);
    }
}