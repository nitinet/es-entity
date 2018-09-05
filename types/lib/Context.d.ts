import { DBSet } from './collection';
import Handler from './Handler';
import * as sql from './sql';
import * as bean from '../bean/index';
import { IEntityType } from './types';
export default class Context {
    private _handler;
    private entityPath;
    private connection;
    private logger;
    dbSetMap: Map<IEntityType<any>, DBSet<any>>;
    constructor(config?: bean.IConnectionConfig, entityPath?: string);
    setLogger(logger: any): void;
    log(arg: any): void;
    init(): Promise<void[]>;
    setConfig(config: bean.IConnectionConfig): void;
    handler: Handler;
    getEntityPath(): string;
    setEntityPath(entityPath: string): void;
    execute(query: string | sql.ISqlNode, args?: Array<any>): Promise<bean.ResultSet>;
    getCriteria(): sql.SqlExpression;
    flush(): void;
    initTransaction(): Promise<this>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
}
