import * as bean from '../bean/index.js';
import Handler from './Handler.js';
export default class SQlite extends Handler {
    handlerName = 'sqlite';
    driver;
    connectionPool;
    constructor(config) {
        super(config);
    }
    async init() {
        this.driver = this.config.driver ?? (await import('sqlite3'));
        this.connectionPool = new this.driver.Database(this.config.database);
    }
    async getConnection() {
        return this.connectionPool;
    }
    async initTransaction(conn) { await conn.run('BEGIN TRANSACTION'); }
    async commit(conn) { await conn.run('COMMIT'); }
    async rollback(conn) { await conn.run('ROLLBACK'); }
    async close(conn) { await conn.close(); }
    async end() { }
    async run(query, args, connection) {
        let queryObj = this.prepareQuery(query, args);
        let temp = null;
        let conn;
        if (connection) {
            conn = connection;
        }
        else {
            conn = this.connectionPool;
        }
        temp = await new Promise((resolve, reject) => {
            conn.run(queryObj.query, queryObj.args, function (err, r) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(r);
                }
            });
        });
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
//# sourceMappingURL=SQLite.js.map