import * as bean from '../bean/index.js';
import Handler from './Handler.js';
const mssqlDriver = await import('mssql');
export default class MsSqlServer extends Handler {
    connectionPool;
    constructor(config) {
        super(config);
        this.connectionPool = new mssqlDriver.ConnectionPool({
            server: this.config.host,
            port: this.config.port,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });
    }
    async init() {
        await this.connectionPool.connect();
    }
    async getConnection() {
        await mssqlDriver.connect({
            server: this.config.host,
            port: this.config.port,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });
        return new mssqlDriver.Request();
    }
    async initTransaction(conn) { }
    async commit(conn) { }
    async rollback(conn) { }
    async close(conn) { }
    async end() { }
    async run(queryStmt, connection) {
        let { query, dataArgs } = this.prepareQuery(queryStmt);
        let conn = connection ?? this.connectionPool.request();
        let data = await conn.query(query);
        let result = new bean.ResultSet();
        result.rowCount = data.rowsAffected[0] ?? 0;
        result.rows = data.recordset;
        return result;
    }
    async stream(queryStmt, connection) {
        let { query, dataArgs } = this.prepareQuery(queryStmt);
        let conn = connection ?? this.connectionPool.request();
        conn.stream = true;
        conn.query(query);
        return conn.toReadableStream();
    }
}
//# sourceMappingURL=MsSqlServer.js.map