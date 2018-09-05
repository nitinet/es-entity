import * as bean from '../bean/index';
import Handler from '../lib/Handler';
import * as sql from '../lib/sql';
import Connection from '../lib/Connection';
export default class PostGreHandler extends Handler {
    driver: any;
    handlerName: string;
    connectionPool: any;
    constructor(config: bean.IConnectionConfig);
    getConnection(): Promise<Connection>;
    initTransaction(conn: any): Promise<void>;
    commit(conn: any): Promise<void>;
    rollback(conn: any): Promise<void>;
    close(conn: any): Promise<void>;
    getTableInfo(tableName: string): Promise<bean.ColumnInfo[]>;
    run(query: string | sql.ISqlNode, args?: Array<any>, connection?: Connection): Promise<bean.ResultSet>;
    convertPlaceHolder(query: string): string;
    insertQuery(collection: string, columns: string, values: string): string;
    limit(val0: string, val1: string): string;
}
