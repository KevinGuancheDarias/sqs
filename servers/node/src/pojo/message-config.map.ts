import { AbstractConfigMap } from './abstract-config.map';

type supportedVars = 'DELIVER_DATE' | 'DELIVER_TIMESTAMP' | 'BODY' | 'ID' | 'EMISION_STATE';


/**
 * Represents a message body
 *
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 * @since 1.0.0
 * @export
 * @class MessageConfig
 * @extends {AbstractConfigMap<supportedVars, any>}
 */
export class MessageConfigMap extends AbstractConfigMap<supportedVars, any> {
    private static readonly _SERVER_PROPERTIES: supportedVars[] = [
        'ID',
        'EMISION_STATE'
    ];

    /**
     * Defines properties that only the server can't use, so a connection, should not be able to issue a SET key=value;
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     */
    public isServerProperty(key: supportedVars) {
        return MessageConfigMap._SERVER_PROPERTIES.some(current => current === key);
    }

    /**
     *
     * @override
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @protected
     * @returns {Map<supportedVars, string[]>}
     */
    protected getSupportedVars(): Map<supportedVars, string[]> {
        return new Map<supportedVars, any>()
            .set('DELIVER_DATE', [])
            .set('DELIVER_TIMESTAMP', [])
            .set('BODY', [])
            .set('ID', [])
            .set('EMISION_STATE', ['PENDING_TIME', 'SUBJECT_REMOVED', 'PENDING_DELIVERY', 'NO_ACK', 'ACK'])
    }

}