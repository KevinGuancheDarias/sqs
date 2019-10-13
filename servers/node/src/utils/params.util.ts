import { TcpSession } from '../types/tcp-session.type';


/**
 * Used to handle the action of defining params in the socket connection
 *
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 * @since 1.0.0
 * @export
 * @class ParamsUtil
 */
export class ParamsUtil {
    private static readonly _PARAMS_REG_EXP: RegExp = /SET (\w+)=([^;]+);\r\n/g;


    /**
     * Detects if the current buffer string matchs as as param definition
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @static
     * @param {string} buffer
     * @returns {boolean}
     */
    public static isParamsBuffer(buffer: string): boolean {
        return new RegExp(this._PARAMS_REG_EXP).test(buffer);
    }

    /**
     * Handle the param definition
     *
     * @todo Do not return always an empty string
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @static
     * @param {TcpSession} tcpSession
     * @param {Map<string, any>} targetMap
     * @param {(key: string, value: string) => boolean} [validationAction]
     * @returns {string} Always return an empty string...
     */
    public static handleParams(
        tcpSession: TcpSession,
        targetMap: Map<string, any>,
        validationAction?: (key: string, value: string) => boolean
    ): string {
        const matches = new RegExp(this._PARAMS_REG_EXP).exec(tcpSession.buffer);
        if (matches) {
            const [_, key, value] = matches.map(current => this._stripEol(current));
            if (!validationAction || validationAction(matches[1], matches[2])) {
                console.log(`Setting ${key} to value ${value}`);
                targetMap.set(key, value);
                tcpSession.socket.write(`\r\nOK: (${key}=${value})\r\n`);
            } else {
                tcpSession.socket.write(`\r\nERROR: Key ${key} is not something assignable\r\n`);
            }
        }
        return '';
    }

    private static _stripEol(input: string): string {
        return input.replace('\r', '').replace('\n', '');
    }
    private constructor() {
        // An util class can't have visible constructor
    }
}