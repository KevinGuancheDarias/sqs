import { Socket } from 'net';

import { TcpSession } from '../types/tcp-session.type';

import { SectionState } from '../enums/section-state.enum';
import { ProgrammingError } from '../errors/programming.error';

type CommandHandler = (this: SocketHandlingUtil, tcpSession: TcpSession, ...args: string[]) => Promise<void>;


/**
 * Has helper static methods to handle a socket connection
 *
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 * @since 1.0.0
 * @export
 * @class SocketHandlingUtil
 */
export class SocketHandlingUtil {

    private static readonly _COMMAND_REGEX_STRING = '\r\nRUN ([A-Z_]*)([\\s?"[A-Z0-9]*"\\s?]*)*\r\n$';
    private static _staticCommands: Map<string, CommandHandler> = new Map();

    /**
     * Adds a command available to any section, that will fire when the client writes RUN COMMAND_NAME
     *
     * @todo In the future this can be DI injected, and commands can be a class implementing some interface, instead of this magic
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @static
     * @param {string} name Name of the command, should be uppercased, and snake like, (will upper it automatically)
     * @param {CommandHandler} handler
     */
    public static addCommand(name: string, handler: CommandHandler): void {
        const upperCasedName = name.toUpperCase();
        if (this._staticCommands.get(upperCasedName)) {
            throw new ProgrammingError(`The name ${upperCasedName} has been already specified as command name`);
        } else {
            this._staticCommands.set(upperCasedName, handler);
        }
    }


    /**
     * Replaces or removes (if no new handler has been specified the registered event handler)
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @static
     * @param {Socket} socket
     * @param {string} event The name of the node's socket event. Ex: 'close', 'data'...
     * @param {(data: string) => void} [handler]
     */
    public static replaceSocketEvent(socket: Socket, event: string, handler?: (data: string) => void): void {
        console.log('Change handler to', handler ? handler.toString().substr(0, 30) : handler);
        if (handler) {
            socket.on(event, handler);
        }
        (<any>socket)._events.data = handler ? handler : () => console.log('Removed event handler');
    }


    /**
     * Prints the help for the current section
     *
     * @todo Research if this is useful... maybe I remove it
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @static
     * @param {Socket} socket
     * @param {string} buffer
     * @param {() => Promise<string[]>} helpFn
     * @returns {Promise<string>}
     */
    public static async onHelp(socket: Socket, buffer: string, helpFn: () => Promise<string[]>): Promise<string> {
        if (buffer.lastIndexOf('GET_HELP;\r\n') > -1) {
            const helpStrings: string[] = await helpFn();
            socket.write(`You can run:\r\n------------\r\n${helpStrings.join('\r\n')}\r\n------------\r\n`);
            return '';
        } else {
            return buffer;
        }
    }


    /**
     * Handles a whole section
     *
     * @todo Research another way to pass tcpSession as I'm repeating a lot of lines of code.. maybe create a composition from Socket, like CurrentSession
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @static
     * @param {string} section
     * @param {TcpSession} tcpSession
     * @returns {Promise<TcpSession>}
     */
    public static handleSection(section: string, tcpSession: TcpSession): Promise<TcpSession> {
        return new Promise(resolve => {
            tcpSession.sectionState = SectionState.WAIT_OPEN;
            SocketHandlingUtil.replaceSocketEvent(tcpSession.socket, 'data', async (data: string) => {
                tcpSession.buffer += data;
                const [sectionStartKeyword, sectionEndKeyword] = [
                    `START_${section.toUpperCase()}`,
                    `END_${section.toUpperCase()}`
                ];
                if (new RegExp(this._COMMAND_REGEX_STRING).test(tcpSession.buffer)) {
                    const [_, command, unparsedArguments] = new RegExp(this._COMMAND_REGEX_STRING).exec(tcpSession.buffer);
                    if (this._staticCommands.has(command)) {
                        const parsedArguments: string[] = unparsedArguments && unparsedArguments.length ? this._findCommandArguments(unparsedArguments) : [];
                        await this._staticCommands.get(command).call(this, tcpSession, ...parsedArguments);
                    } else {
                        this.asyncWrite(tcpSession.socket, `ERROR: Command with name ${command} doesn't exists\r\n`);
                        tcpSession.buffer = '';
                    }
                } else if (tcpSession.sectionState === SectionState.WAIT_OPEN) {
                    tcpSession.buffer = await SocketHandlingUtil.onHelp(tcpSession.socket, tcpSession.buffer, async () => [sectionStartKeyword]);
                    const confIndex: number = tcpSession.buffer.indexOf(`${sectionStartKeyword}\r\n`);
                    if (confIndex > -1) {
                        tcpSession.onStartSection && await tcpSession.onStartSection(tcpSession);
                        tcpSession.buffer = '';
                        tcpSession.socket.write('OK\r\n');
                        tcpSession.sectionState = SectionState.ACCEPT_INPUT;
                        tcpSession.sectionName = section;
                    }
                } else {
                    tcpSession.buffer = tcpSession.onHelp ? await SocketHandlingUtil.onHelp(
                        tcpSession.socket,
                        tcpSession.buffer,
                        async () => [await tcpSession.onHelp(tcpSession)]
                    )
                        : tcpSession.buffer;
                    if (tcpSession.buffer.lastIndexOf(`\r\n${sectionEndKeyword}\r\n`) > -1) {
                        tcpSession.buffer = tcpSession.buffer.replace(new RegExp(`\r\n${sectionEndKeyword}\r\n`, 'g'), '');
                        const sectionError = tcpSession.onEndSection
                            ? await tcpSession.onEndSection(tcpSession)
                            : '';
                        tcpSession.buffer = '';
                        if (!sectionError) {
                            tcpSession.socket.write('OK\r\n');
                            SocketHandlingUtil.replaceSocketEvent(tcpSession.socket, 'data');
                            resolve(tcpSession);
                        } else {
                            tcpSession.socket.write(`ERROR: ${sectionError}\r\n`);
                        }
                    } else if (await tcpSession.isHandlable(tcpSession)) {
                        tcpSession.buffer = await tcpSession.handleRegularInput(tcpSession);
                    }
                }
            });
        });
    }

    /**
     * Used to wait for socket.write to complete
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @static
     * @param {Socket} socket
     * @param {string} text
     * @returns {Promise<Error>}
     */
    public static asyncWrite(socket: Socket, text: string): Promise<Error> {
        return new Promise(resolve => socket.write(text, (err) => resolve(err)));
    }

    private static _findCommandArguments(commandArgs: string): string[] {
        const re = /"(.*?)"/g;
        const result = [];
        let current;
        while (current = re.exec(commandArgs)) {
            result.push(current.pop());
        }
        return result.length > 0
            ? result
            : [commandArgs];

    }

    private constructor() {
        // An util class can't have visible constructor
    }
}