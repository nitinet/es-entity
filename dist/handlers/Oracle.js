import * as bean from '../bean/index.js';
import Handler from './Handler.js';
const oracledbDriver = await import('oracledb');
export default class Oracle extends Handler {
    connectionPool;
    async init() {
        this.connectionPool = await oracledbDriver.createPool({
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
    async commit(conn) {
        return conn.commit();
    }
    async rollback(conn) {
        return conn.rollback();
    }
    async close(conn) {
        return conn.close();
    }
    async end() { }
    async run(queryStmt, connection) {
        let { query, dataArgs } = this.prepareQuery(queryStmt);
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
    async stream(queryStmt, connection) {
        let { query, dataArgs } = this.prepareQuery(queryStmt);
        let stream;
        if (connection) {
            stream = connection.queryStream(query, dataArgs);
        }
        else {
            let conn = await this.connectionPool.getConnection();
            stream = conn.queryStream(query, dataArgs);
            stream.on('end', function () {
                stream.destroy();
            });
            stream.on('close', function () {
                conn.close();
            });
        }
        return stream;
    }
}
//# sourceMappingURL=Oracle.js.map