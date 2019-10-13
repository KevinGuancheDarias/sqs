import { Socket } from 'net';
import { State } from '../enums/state.enum';
import { SectionState } from '../enums/section-state.enum';
import { SessionConfigMap } from '../pojo/session-config.map';

type ValidRoles = 'CONSUMER' | 'PRODUCER';

/**
 * Represents the current TcpSession, can store params, such as Socket, buffer, on
 *
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 * @since 1.0.0
 * @export
 * @interface TcpSession
 */
export interface TcpSession {
    socket: Socket;
    buffer: string;

    sessionConfig?: SessionConfigMap;

    role?: ValidRoles;

    /**
     * Represents the current section state
     */
    sectionState: SectionState;

    /**
     * Represents the current section name
     */
    sectionName?: string;

    /**
     *  Map that may or may NOT be used to store configuration
     */
    sectionMap?: Map<string, any>;


    /**
     * Action to run when the section starts
     * 
     * @since 1.0.0
     * @memberof TcpSession
     */
    onStartSection?: (tcpSession: TcpSession) => Promise<void>;

    /**
     * Action to run when the section ends
     * 
     * @since 1.0.0
     * @returns If everything is ok, should return an empty string, else, the returned value is assumed to be an error string
     */
    onEndSection?: (tcpSession: TcpSession) => Promise<string>;


    /**
     *  Finds the help for the current section
     * 
     * @since 1.0.0
     * @memberof TcpSession
     */
    onHelp?: (tcpSession: TcpSession) => Promise<string>;

    /**
     * Used to see if the current buffer is something that can be handled (tested when inside a section, so text between SESSION_START and SESSION_END )
     * 
     * @since 1.0.0
     */
    isHandlable: (tcpSession: TcpSession) => Promise<boolean>;

    /**
     * Handles the input
     * 
     * @returns  The buffer, (usually it returns an empty string, meaning it cleans the buffer)
     */
    handleRegularInput: (tcpSession: TcpSession) => Promise<string>;
}