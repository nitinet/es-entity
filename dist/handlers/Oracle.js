import * as bean from '../bean/index.js';
import Handler from './Handler.js';
import * as sql from '../sql/index.js';
export default class Oracle extends Handler {
    handlerName = 'oracle';
    driver;
    connectionPool;
    constructor(config) {
        super(config);
    }
    async init() {
        this.driver = this.config.driver ?? await import('oracledb');
        this.connectionPool = await this.driver.createPool({
            user: this.config.username,
            password: this.config.password,
            connectString: `${this.config.host}:${this.config.port}/${this.config.database}`
        });
    }
    async getConnection() {
        let conn = await this.driver.getConnection({
            user: this.config.username,
            password: this.config.password,
            connectString: `${this.config.host}:${this.config.port}/${this.config.database}`
        });
        return conn;
    }
    async initTransaction(conn) { }
    async commit(conn) { return conn.commit(); }
    async rollback(conn) { return conn.rollback(); }
    async close(conn) { return conn.close(); }
    async end() { }
    async run(query, args, connection) {
        let dataArgs = Array();
        let q;
        if (query instanceof sql.Statement) {
            q = query.eval(this);
            dataArgs.push(...query.args);
        }
        else {
            q = query;
            if (args)
                dataArgs.push(...args);
        }
        let temp = null;
        if (connection) {
            temp = await connection.execute(q);
        }
        else {
            let conn = await this.connectionPool.getConnection();
            try {
                temp = await conn.execute(q, dataArgs);
            }
            finally {
                conn.close();
            }
        }
        let result = new bean.ResultSet();
        return result;
    }
}
//# sourceMappingURL=Oracle.js.map