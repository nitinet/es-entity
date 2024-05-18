import stream from 'stream';
import * as bean from '../bean/index.js';
import Handler from './Handler.js';
const sqliteDriver = await import('sqlite3');
export default class SQlite extends Handler {
    connectionPool;
    async init() {
        this.connectionPool = await new Promise((res, rej) => {
            let temp = new sqliteDriver.Database(this.config.database, err => {
                if (err)
                    rej(err);
            });
            res(temp);
        });
    }
    async getConnection() {
        return this.connectionPool;
    }
    async initTransaction(conn) {
        await new Promise((res, rej) => {
            conn.run('BEGIN TRANSACTION', (data, err) => {
                if (err)
                    rej(err);
                else
                    res(data);
            });
        });
    }
    async commit(conn) {
        await new Promise((res, rej) => {
            conn.run('COMMIT', (data, err) => {
                if (err)
                    rej(err);
                else
                    res(data);
            });
        });
    }
    async rollback(conn) {
        await new Promise((res, rej) => {
            conn.run('ROLLBACK', (data, err) => {
                if (err)
                    rej(err);
                else
                    res(data);
            });
        });
    }
    async close(conn) {
    }
    async end() { }
    async run(queryStmt, connection) {
        let { query, dataArgs } = this.prepareQuery(queryStmt);
        let conn = connection ?? this.connectionPool;
        let data = await new Promise((resolve, reject) => {
            conn.all(query, dataArgs, function (err, r) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(r);
                }
            });
        });
        let result = new bean.ResultSet();
        result.rows = data;
        result.rowCount = data.length;
        return result;
    }
    async stream(queryStmt, connection) {
        let { query, dataArgs } = this.prepareQuery(queryStmt);
        let conn = connection ?? this.connectionPool;
        let dataStream = new stream.Duplex();
        conn.each(query, dataArgs, (err, row) => {
            if (err)
                throw err;
            dataStream.write(row);
        }, (err, count) => {
            if (err)
                throw err;
            dataStream.write(null);
        });
        return dataStream;
    }
}
//# sourceMappingURL=SQLite.js.map