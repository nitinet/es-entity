"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bean = require("../bean/index");
const Handler_1 = require("../lib/Handler");
const sql = require("../lib/sql");
const Connection_1 = require("../lib/Connection");
class Mysql extends Handler_1.default {
    constructor(config) {
        super();
        this.handlerName = 'mysql';
        this.connectionPool = null;
        this.driver = null;
        this.config = config;
    }
    async init() {
        this.driver = this.config.driver || await Promise.resolve().then(() => require('mysql'));
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
        let that = this;
        return new Promise((resolve, reject) => {
            let conn = that.driver.createConnection({
                host: that.config.host,
                port: that.config.port,
                user: that.config.username,
                password: that.config.password,
                database: that.config.database
            });
            conn.connect((err) => {
                if (err) {
                    that.context.log('Connection Creation Failed');
                    reject(err);
                }
                else {
                    that.context.log('Connection Creation Successful');
                    let res = new Connection_1.default(this, conn);
                    resolve(res);
                }
            });
        });
    }
    openConnetion(conn) {
        let that = this;
        let p = new Promise((resolve, reject) => {
            conn = this.driver.createConnection({
                host: this.config.host,
                user: this.config.username,
                password: this.config.password,
                database: this.config.database
            });
            conn.connect((err) => {
                if (err) {
                    that.context.log('Connection Creation Failed');
                    reject(err);
                }
                else {
                    that.context.log('Connection Creation Successful');
                    resolve(conn);
                }
            });
        });
        return p;
    }
    initTransaction(conn) {
        let that = this;
        let p = new Promise((resolve, reject) => {
            conn.beginTransaction((err) => {
                if (err) {
                    that.context.log('Initializing Transaction Failed');
                    reject(err);
                }
                else {
                    that.context.log('Initializing Transaction Successful');
                    resolve();
                }
            });
        });
        return p;
    }
    commit(conn) {
        let that = this;
        let p = new Promise((resolve, reject) => {
            conn.commit((err) => {
                if (err) {
                    that.context.log('Commiting Transaction Failed');
                    reject(err);
                }
                else {
                    that.context.log('Commiting Transaction Successful');
                    resolve();
                }
            });
        });
        return p;
    }
    rollback(conn) {
        let p = new Promise((resolve) => {
            conn.rollback(() => {
                resolve();
            });
        });
        return p;
    }
    close(conn) {
        let that = this;
        let p = new Promise((resolve, reject) => {
            conn.end((err) => {
                if (err) {
                    that.context.log('Connection Close Failed');
                    reject(err);
                }
                else {
                    that.context.log('Connection Close Successful');
                    resolve();
                }
            });
        });
        return p;
    }
    async end() { return null; }
    async getTableInfo(tableName) {
        let r = await this.run('describe ' + tableName);
        let result = new Array();
        r.rows.forEach((row) => {
            let col = new bean.ColumnInfo();
            col.field = row['Field'];
            let columnType = row['Type'].toLowerCase();
            if (columnType.includes('tinyint(1)')) {
                col.type = bean.ColumnType.BOOLEAN;
            }
            else if (columnType.includes('int')
                || columnType.includes('float')
                || columnType.includes('double')
                || columnType.includes('decimal')) {
                col.type = bean.ColumnType.NUMBER;
            }
            else if (columnType.includes('varchar')
                || columnType.includes('text')) {
                col.type = bean.ColumnType.STRING;
            }
            else if (columnType.includes('timestamp')) {
                col.type = bean.ColumnType.DATE;
            }
            else if (columnType.includes('json')) {
                col.type = bean.ColumnType.JSON;
            }
            col.nullable = row['Null'] == 'YES' ? true : false;
            col.primaryKey = row['Key'].indexOf('PRI') >= 0 ? true : false;
            col.default = row['Default'];
            col.extra = row['Extra'];
            result.push(col);
        });
        return result;
    }
    async run(query, args, connection) {
        let q = null;
        if (typeof query === 'string') {
            q = query;
        }
        else if (query instanceof sql.Statement) {
            q = query.eval(this);
            args = query.args;
        }
        this.context.log('query:' + q);
        let result = new bean.ResultSet();
        let p = new Promise((resolve, reject) => {
            if (connection && connection instanceof Connection_1.default && connection.Handler.handlerName == this.handlerName && connection.conn) {
                connection.conn.query(q, args, function (err, r) {
                    if (err) {
                        reject(err);
                    }
                    resolve(r);
                });
            }
            else {
                this.connectionPool.query(q, args, function (err, r) {
                    if (err) {
                        reject(err);
                    }
                    resolve(r);
                });
            }
        }).then((res) => {
            if (res.insertId)
                result.id = res.insertId;
            if (res.changedRows) {
                result.rowCount = res.changedRows;
            }
            else if (Array.isArray(res)) {
                result.rows = res;
                result.rowCount = res.length;
            }
            return result;
        });
        return p;
    }
}
exports.default = Mysql;
