import * as bean from '../bean/index';
import Handler from '../lib/Handler';
import * as sql from '../lib/sql';
import Connection from '../lib/Connection';
export default class Mysql extends Handler {
    handlerName: string;
    connectionPool: any;
    driver: any;
    constructor(config: bean.IConnectionConfig);
    getConnection(): Promise<Connection>;
    openConnetion(conn: any): Promise<any>;
    initTransaction(conn: any): Promise<void>;
    commit(conn: any): Promise<void>;
    rollback(conn: any): Promise<void>;
    close(conn: any): Promise<void>;
    end(): Promise<any>;
    getTableInfo(tableName: string): Promise<Array<bean.ColumnInfo>>;
    run(query: string | sql.INode, args?: Array<any>, connection?: Connection): Promise<bean.ResultSet>;
}
