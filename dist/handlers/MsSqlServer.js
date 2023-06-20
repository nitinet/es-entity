import * as bean from '../bean/index.js';
import Handler from './Handler.js';
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
    async run(query, args, connection) {
        let queryObj = this.prepareQuery(query, args);
        let conn;
        if (connection) {
            conn = connection;
        }
        else {
            conn = this.connectionPool.request();
        }
        let temp = await conn.query(queryObj.query);
        let result = new bean.ResultSet();
        result.rowCount = temp.rowsAffected[0] ?? 0;
        result.rows = temp.recordset;
        return result;
    }
}
//# sourceMappingURL=MsSqlServer.js.map