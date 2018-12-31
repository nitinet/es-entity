import * as bean from '../bean/index';
import Handler from '../lib/Handler';
import * as sql from '../lib/sql';
import Connection from '../lib/Connection';
export default class MsSqlServer extends Handler {
    handlerName: string;
    connectionPool: any;
    driver: any;
    constructor(config: bean.IConnectionConfig);
    setConnectionPool(): Promise<void>;
    getConnection(): any;
    openConnetion(conn: any): Promise<any>;
    initTransaction(conn: any): Promise<any>;
    commit(conn: any): Promise<any>;
    rollback(conn: any): Promise<any>;
    close(conn: any): Promise<any>;
    end(): Promise<any>;
    getTableInfo(tableName: string): Promise<Array<bean.ColumnInfo>>;
    run(query: string | sql.INode, args?: Array<any>, connection?: Connection): Promise<bean.ResultSet>;
}
