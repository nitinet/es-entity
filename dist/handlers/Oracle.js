import * as bean from '../bean/index.js';
import * as sql from '../sql/index.js';
import Handler from './Handler.js';
export default class Oracle extends Handler {
    handlerName = 'oracle';
    driver;
    connectionPool;
    async init() {
        this.driver = this.config.driver ?? await import('oracledb');
        this.connectionPool = await this.driver.createPool({
            user: this.config.username,
            password: this.config.password,
            connectString: `${this.config.host}:${this.config.port}/${this.config.database}`
        });
    }
    async getConnection() {
        let conn = await this.connectionPool.getConnection();
        return conn;
    }
    async initTransaction(conn) { }
    async commit(conn) { return conn.commit(); }
    async rollback(conn) { return conn.rollback(); }
    async close(conn) { return conn.close(); }
    async end() { }
    async run(queryStmt, connection) {
        let query;
        let dataArgs = [];
        if (Array.isArray(queryStmt)) {
            let tempQueries = [];
            queryStmt.forEach(a => {
                if (!(a instanceof sql.Statement))
                    throw new Error('Invalid Statement');
                tempQueries.push(a.eval(this));
                dataArgs.push(...a.args);
            });
            query = tempQueries.join('; ');
        }
        else if (queryStmt instanceof sql.Statement) {
            query = queryStmt.eval(this);
            dataArgs.push(...queryStmt.args);
        }
        else {
            query = queryStmt;
        }
        let temp;
        if (connection) {
            temp = await connection.execute(query, dataArgs);
        }
        else {
            let conn = await this.connectionPool.getConnection();
            try {
                temp = await conn.execute(query, dataArgs);
            }
            finally {
                conn.close();
            }
        }
        let result = new bean.ResultSet();
        result.rows = temp.rows ?? [];
        result.rowCount = temp.rowsAffected ?? 0;
        return result;
    }
}
//# sourceMappingURL=Oracle.js.map