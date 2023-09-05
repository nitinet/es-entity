import * as bean from '../bean/index.js';
import * as sql from '../sql/index.js';
import Handler from './Handler.js';
export default class Mysql extends Handler {
    handlerName = 'mysql';
    driver;
    connectionPool;
    async init() {
        this.driver = this.config.driver ?? await import('mysql');
        this.connectionPool = this.driver.createPool({
            connectionLimit: this.config.connectionLimit,
            host: this.config.host,
            port: this.config.port,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });
    }
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
        let temp = null;
        if (connection) {
            temp = await new Promise((resolve, reject) => {
                connection.query(query, dataArgs, function (err, r) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(r);
                    }
                });
            });
        }
        else {
            temp = await new Promise((resolve, reject) => {
                this.connectionPool.query(query, dataArgs, function (err, r) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(r);
                    }
                });
            });
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
//# sourceMappingURL=Mysql.js.map