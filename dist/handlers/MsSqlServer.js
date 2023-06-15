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