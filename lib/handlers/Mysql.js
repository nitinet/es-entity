import * as bean from '../bean/index.js';
import Handler from './Handler.js';
const mysqlDriver = await import('mysql');
export default class Mysql extends Handler {
    connectionPool;
    constructor(config) {
        super(config);
        this.connectionPool = mysqlDriver.createPool({
            connectionLimit: this.config.connectionLimit,
            host: this.config.host,
            port: this.config.port,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });
    }
    async init() { }
    getConnection() {
        return new Promise((res, rej) => {
            this.connectionPool.getConnection((err, c) => {
                if (err)
                    rej(err);
                else
                    res(c);
            });
        });
    }
    initTransaction(conn) {
        return new Promise((resolve, reject) => {
            conn.beginTransaction((err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    commit(conn) {
        return new Promise((resolve, reject) => {
            conn.commit((err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    rollback(conn) {
        return new Promise((resolve, reject) => {
            conn.rollback((err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    async close(conn) {
        conn.release();
    }
    async end() { }
    async run(queryStmt, connection) {
        let { query, dataArgs } = this.prepareQuery(queryStmt);
        let conn = connection ?? this.connectionPool;
        let data = await new Promise((resolve, reject) => {
            conn.query(query, dataArgs, function (err, r) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(r);
                }
            });
        });
        let result = new bean.ResultSet();
        if (data.insertId)
            result.id = data.insertId;
        if (data.changedRows) {
            result.rowCount = data.changedRows;
        }
        else if (Array.isArray(data)) {
            result.rows = data;
            result.rowCount = data.length;
        }
        return result;
    }
    async stream(queryStmt, connection) {
        let { query, dataArgs } = this.prepareQuery(queryStmt);
        let conn = connection ?? this.connectionPool;
        let stream = conn.query(query, dataArgs).stream();
        return stream;
    }
}
//# sourceMappingURL=Mysql.js.map