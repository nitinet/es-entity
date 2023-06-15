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
    async commit(conn) { return conn.conn.commit(); }
    async rollback(conn) { return conn.conn.rollback(); }
    async close(conn) { return conn.conn.close(); }
    async end() { }
    async run(query, args, connection) {
        let dataArgs = Array();
        let q;
        if (typeof query === 'string') {
            q = query;
            if (args)
                dataArgs.push(...args);
        }
        else if (query instanceof sql.Statement) {
            q = query.eval(this);
            dataArgs.push(...query.args);
        }
        else {
            q = '';
        }
        let temp = null;
        if (connection && connection instanceof bean.Connection && connection.Handler.handlerName == this.handlerName && connection.conn) {
            temp = await connection.conn.execute(q, args);
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
        if (temp.insertId)
            result.id = temp.insertId;
        if (temp.changedRows) {
            result.rowCount = temp.changedRows;
        }
        else if (Array.isArray(temp)) {
            result.rows = temp;
            result.rowCount = temp.length;
        }
        return result;
    }
}
//# sourceMappingURL=Oracle.js.map