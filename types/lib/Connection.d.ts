import Handler from './Handler';
export default class Connection {
    private handler;
    conn: any;
    constructor(handler: Handler, conn?: any);
    readonly Handler: Handler;
    open(): Promise<void>;
    initTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    close(): Promise<void>;
}
