import Handler from './Handler';
import * as Query from './Query';
import Connection from './Connection';
import * as bean from '../bean/index';
export default class Context {
    entityPath: string;
    handler: Handler;
    connection: Connection;
    logger: any;
    constructor(config?: bean.IConnectionConfig, entityPath?: string);
    setLogger(logger: any): void;
    log(arg: any): void;
    init(): Promise<void[]>;
    setConfig(config: bean.IConnectionConfig): void;
    setHandler(handler: Handler): void;
    setEntityPath(entityPath: string): void;
    execute(query: string | Query.ISqlNode, args?: Array<any>): Promise<bean.ResultSet>;
    getCriteria(): Query.SqlExpression;
    flush(): void;
    initTransaction(): Promise<this>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
}
