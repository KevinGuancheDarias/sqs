import { MessageStoreService } from '../interfaces/message-store-service.interface';
import { MessageConfigMap } from '../pojo/message-config.map';
import { MessageState } from '../enums/message-state.enum';
import { open, Database, Statement } from 'sqlite';
import { ProgrammingError } from '../errors/programming.error';

interface MessageRow {
    uuid: string;
    body: string;
    status: MessageState;
    deliver_date: string;
    deliver_after: number;
    created_at: string;
}

type MessagesMap = Map<string, MessageConfigMap>;

export class SqliteMessageStoreService implements MessageStoreService {

    private _connection: Database;
    private _localStore: MessagesMap = new Map();

    public constructor(private _dbPath: string) { }


    /**
     * Inits the service (opens the sqlite file)
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @returns {Promise<void>}
     */
    public async init(): Promise<void> {
        this._connection = await open(this._dbPath);
        await this._connection.get('CREATE TABLE IF NOT EXISTS messages (uuid CHAR(40) PRIMARY KEY, body TEXT, status INT, deliver_date DATETIME, deliver_after INT, created_at DATETIME)');
    }

    /**
     * Finds all the messages
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @returns {Promise<MessagesMap>}
     */
    public async findAll(): Promise<MessagesMap> {
        const retVal: MessagesMap = new Map();
        (await this._runPreparedStatement('SELECT * FROM messages')).forEach(current => {
            const currentMessage: MessageConfigMap = this._convertRowToMessageMap(current);
            retVal.set(current.uuid, new MessageConfigMap(currentMessage));
            this._localStore.set(current.uuid, currentMessage);
        });
        return retVal;
    }

    /**
     * Finds one message
     *
     * @override
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param {string} uuid
     * @returns {Promise<MessageConfigMap>} null if doesn't exists
     */
    public async findOne(uuid: string): Promise<MessageConfigMap> {
        if (this._localStore.get(uuid)) {
            return new MessageConfigMap(this._localStore.get(uuid)) || null;
        } else {
            return this._convertRowToMessageMap(await this._findOneWithPreparedStatement('SELECT * FROM messages WHERE uuid=?', uuid));
        }
    }

    /**
     * Finds all messages that have pending observer state
     * 
     * @override
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param [limit] Max number of rows, if not specified, will be unlimited
     * @returns {Promise<MessagesMap>}
     */
    public findByPendingObserver(limit?: number): Promise<MessagesMap> {
        return this.findByStatus(MessageState.PENDING_OBSERVER, limit);
    }

    /**
     * Finds messages with specified state
     * 
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param status The status to search for
     * @param [limit] Max number of rows, if not specified, will be unlimited
     * @returns
     */
    public async findByStatus(status: MessageState, limit?: number): Promise<MessagesMap> {
        const limitString = limit ? `LIMIT ${limit}` : '';
        const rows: MessageRow[] = await this._runPreparedStatement(`SELECT * FROM messages WHERE status=? ${limitString}`, status.toString());
        const retVal: MessagesMap = new Map();
        rows.forEach(current => retVal.set(current.uuid, this._convertRowToMessageMap(current)));
        return retVal;
    }

    /**
     * Saves a new message to the database, or updates an existing one
     * 
     * @override
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param {MessageConfigMap} messageMap
     * @returns {Promise<void>}
     */
    public async saveMessage(messageMap: MessageConfigMap): Promise<void> {
        if (await this.findOne(messageMap.get('ID'))) {
            await this._runPreparedStatement(
                'UPDATE messages SET uuid=?, body=?, status=?, deliver_date=?, deliver_after=? WHERE uuid=?',
                messageMap.get('ID'),
                messageMap.get('BODY'),
                messageMap.get('EMISION_STATE'),
                messageMap.get('DELIVER_DATE'),
                messageMap.get('DELIVER_TIMESTAMP'),
                messageMap.get('ID'),
            );
        } else {
            const now: Date = new Date();
            await this._runPreparedStatement(
                'INSERT INTO messages (uuid, body, status, deliver_date, deliver_after, created_at)VALUES (?,?,?,?,?, ?)',
                messageMap.get('ID'),
                messageMap.get('BODY'),
                messageMap.get('EMISION_STATE'),
                messageMap.get('DELIVER_DATE'),
                messageMap.get('DELIVER_TIMESTAMP'),
                now.toISOString()
            );
            messageMap.set('CREATED_AT', now);
        }
        this._localStore.set(messageMap.get('ID'), messageMap);
    }

    /**
     * Updates the state of a message
     * 
     * @override
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param uuid 
     * @param state The new state
     */
    public async updateStatus(uuid: string | string[], state: MessageState): Promise<any> {
        if (typeof uuid === 'string') {
            await this._runPreparedStatement('UPDATE messages SET status=? WHERE uuid=?', state.toString(), uuid);
            const message: MessageConfigMap = this._localStore.get(uuid);
            message.set('EMISION_STATE', state);
            return message;
        } else if (uuid instanceof Array) {
            const inClause = ['\'fakeuuid\''].concat(uuid.map(() => '?')).join(',');
            await this._runPreparedStatement(`UPDATE messages SET status=? WHERE uuid IN(${inClause})`, ...[state.toString(), ...uuid]);
            const retVal: MessagesMap = new Map();
            uuid.forEach(current => {
                const message: MessageConfigMap = this._localStore.get(current);
                message.set('EMISION_STATE', state);
                retVal.set(current, new MessageConfigMap(message));
            });
        } else {
            throw new ProgrammingError(`Unexpected passed value for uuid of ${uuid}`);
        }
    }

    /**
     * Changes the state of messages with PENDING_OBSERVER to READY_TO_DELIVER
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param {string} uuid
     * @returns {Promise<void>}
     */
    public async doRemovePendingObserver(uuid: string): Promise<void> {
        await this._runPreparedStatement(
            'UPDATE messages SET status=? WHERE uuid=? AND status=?',
            MessageState.READY_TO_DELIVER.toString(),
            uuid,
            MessageState.PENDING_OBSERVER.toString(),
        );
        const message = this._localStore.get(uuid);
        if (message && message.get('EMISION_STATE') === MessageState.PENDING_OBSERVER) {
            message.set('EMISION_STATE', MessageState.READY_TO_DELIVER.toString());
        }
    }

    /**
     * Sets the ACK value of a message
     *
     * @override
     *  @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param {string} uuid
     * @param {boolean} value
     * @returns {Promise<void>}
     */
    public async markAck(uuid: string, value: boolean): Promise<void> {
        const ackState: string = value ? MessageState.READY_TO_DELIVER.toString() : MessageState.NOT_WANTING_TO_ACK.toString();
        await this._runPreparedStatement(
            'UPDATE messages SET status=? WHERE uuid=? AND status=?',
            ackState,
            uuid,
            MessageState.PENDING_OBSERVER.toString(),
        );
        const message = this._localStore.get(uuid);
        if (message && message.get('EMISION_STATE') === MessageState.PENDING_OBSERVER) {
            message.set('EMISION_STATE', MessageState.READY_TO_DELIVER.toString());
        }
    }


    /**
     * Marks the message as delivered... so removes it from the stores
     *
     * @override
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @param {string} uuid
     * @returns {Promise<void>}
     */
    public async doMarkAsDelivered(uuid: string): Promise<void> {
        await this._runPreparedStatement('DELETE FROM messages WHERE uuid=?', uuid);
        this._localStore.delete(uuid);
    }

    /**
     * Marks all the NOT_WANTING_TO_ACK messages as READY_TO_DELIVER and return them all
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @returns {Promise<MessagesMap>}
     */
    public async doResetAckAndFind(): Promise<MessagesMap> {
        await this._runPreparedStatement(
            'UPDATE messages SET status=? WHERE status=?',
            MessageState.READY_TO_DELIVER.toString(),
            MessageState.NOT_WANTING_TO_ACK.toString(),
        );
        const retVal: MessagesMap = new Map();
        this._localStore.forEach(current => {
            if (current.get('EMISION_STATE') === MessageState.NOT_WANTING_TO_ACK) {
                current.set('EMISION_STATE', MessageState.READY_TO_DELIVER);
                retVal.set(current.get('ID'), current);
            }
        });
        return retVal;
    }

    private async _runPreparedStatement(sql: string, ...args: string[]): Promise<MessageRow[]> {
        const statement: Statement = await this._connection.prepare(sql, ...args);
        const rows: any[] = [];
        await statement.each((err, row) => {
            if (err) {
                throw err;
            } else {
                rows.push(row);
            }
        });
        await statement.finalize();
        return rows;
    }

    private async _findOneWithPreparedStatement(sql: string, ...args: string[]): Promise<MessageRow> {
        const rows = await this._runPreparedStatement(sql, ...args);
        return rows.length ? rows[0] : null;
    }

    private _convertRowToMessageMap(row: MessageRow): MessageConfigMap {
        if (row) {
            const retVal: MessageConfigMap = new MessageConfigMap();
            retVal.set('ID', row.uuid);
            retVal.set('DELIVER_DATE', row.deliver_date && new Date(row.deliver_date));
            retVal.set('DELIVER_TIMESTAMP', row.deliver_after);
            retVal.set('CREATED_AT', new Date(row.created_at));
            retVal.set('EMISION_STATE', row.status);
            retVal.set('BODY', row.body);
            return retVal;
        } else {
            return null;
        }
    }
}