import * as bean from '../bean/index.js';
import Handler from './Handler.js';
import * as sql from '../sql/index.js';
export default class MsSqlServer extends Handler {
    handlerName = 'mssql';
    driver;
    connectionPool;
    constructor(config) {
        super(config);
    }
    async init() {
        this.driver = this.config.driver ?? await import('mssql');
        let temp = new this.driver.ConnectionPool({
            server: this.config.host,
            port: this.config.port,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });
        this.connectionPool = await temp.connect();
    }
    async getConnection() {
        await this.driver.connect({
            server: this.config.host,
            port: this.config.port,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });
        return new this.driver.Request();
    }
    async initTransaction(conn) { }
    async commit(conn) { }
    async rollback(conn) { }
    async close(conn) { }
    async end() { }
    async getTableInfo(tableName) {
        let r = await this.run(`select Field, Type, Null, Key, Default, Extra from information_schema.columns where table_name = '${tableName}'`);
        let result = new Array();
        r.rows.forEach((row) => {
            let col = new bean.ColumnInfo();
            col.field = row['Field'];
            let columnType = row['Type'].toLowerCase();
            if (columnType.includes('tinyint(1)')) {
                col.type = bean.ColumnType.BOOLEAN;
            }
            else if (columnType.includes('int')
                || columnType.includes('float')
                || columnType.includes('double')
                || columnType.includes('decimal')) {
                col.type = bean.ColumnType.NUMBER;
            }
            else if (columnType.includes('varchar')
                || columnType.includes('text')) {
                col.type = bean.ColumnType.STRING;
            }
            else if (columnType.includes('timestamp')) {
                col.type = bean.ColumnType.DATE;
            }
            else if (columnType.includes('blob')
                || columnType.includes('binary')) {
                col.type = bean.ColumnType.BINARY;
            }
            col.nullable = row['Null'] == 'YES' ? true : false;
            col.primaryKey = row['Key'].indexOf('PRI') >= 0 ? true : false;
            col.default = row['Default'];
            col.extra = row['Extra'];
            result.push(col);
        });
        return result;
    }
    async run(query, args, connection) {
        let q;
        if (query instanceof sql.Statement) {
            q = query.eval(this);
        }
        else {
            q = query;
        }
        let conn;
        if (connection) {
            conn = connection;
        }
        else {
            conn = this.connectionPool.request();
        }
        let result = new bean.ResultSet();
        return result;
    }
}
//# sourceMappingURL=MsSqlServer.js.map