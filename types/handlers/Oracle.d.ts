import * as bean from '../bean';
import Handler from '../lib/Handler';
import * as sql from '../lib/sql';
export default class Oracle extends Handler {
    handlerName: string;
    driver: any;
    constructor(config: bean.IConnectionConfig);
    getConnection(): Promise<any>;
    openConnetion(conn: any): Promise<any>;
    initTransaction(conn: any): Promise<any>;
    commit(conn: any): Promise<any>;
    rollback(conn: any): Promise<any>;
    close(conn: any): Promise<any>;
    end(): Promise<any>;
    getTableInfo(tableName: string): Promise<Array<bean.ColumnInfo>>;
    run(query: string | sql.INode): Promise<bean.ResultSet>;
}
