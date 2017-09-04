"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("../Util");
const Handler = require("./../Handler");
const Query = require("./../Query");
const Connection_1 = require("../Connection");
class MysqlHandler extends Handler.default {
    constructor(config) {
        super();
        this.handlerName = 'mysql';
        this.connectionPool = null;
        this.driver = null;
        this.driver = require('mysql');
        this.config = config;
        this.connectionPool = this.driver.createPool({
            connectionLimit: this.config.connectionLimit,
            host: this.config.hostname,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });
    }
    getConnection() {
        return new Promise((resolve, reject) => {
            let conn = this.driver.createConnection({
                host: this.config.hostname,
                user: this.config.username,
                password: this.config.password,
                database: this.config.database
            });
            conn.connect((err) => {
                if (err)
                    reject(err);
                else {
                    let res = new Connection_1.default(this, conn);
                    resolve(res);
                }
            });
        });
    }
    openConnetion(conn) {
        let p = new Promise((resolve, reject) => {
            conn = this.driver.createConnection({
                host: this.config.hostname,
                user: this.config.username,
                password: this.config.password,
                database: this.config.database
            });
            conn.connect((err) => {
                if (err)
                    reject(err);
                else
                    resolve(conn);
            });
        });
        return p;
    }
    initTransaction(conn) {
        let p = new Promise((resolve, reject) => {
            conn.beginTransaction((err) => {
                if (err)
                    reject('Initializing Transaction Failed');
                else
                    resolve();
            });
        });
        return p;
    }
    commit(conn) {
        let p = new Promise((resolve, reject) => {
            conn.commit((err) => {
                if (err)
                    reject('Initializing Transaction Failed');
                else
                    resolve();
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
        let p = new Promise((resolve, reject) => {
            conn.end((err) => {
                if (err)
                    reject('Initializing Transaction Failed');
                else
                    resolve();
            });
        });
        return p;
    }
    getTableInfo(tableName) {
        let p = this.run("describe " + tableName);
        let r = util.deAsync(p);
        let result = new Array();
        r.rows.forEach((row) => {
            let a = new Handler.ColumnInfo();
            a.field = row["Field"];
            let columnType = row["Type"].toLowerCase();
            if (columnType.includes("tinyint(1)")) {
                a.type = "boolean";
            }
            else if (columnType.includes("int")
                || columnType.includes("float")
                || columnType.includes("double")
                || columnType.includes("decimal")) {
                a.type = "number";
            }
            else if (columnType.includes("varchar")
                || columnType.includes('text')
                || columnType.includes('json')) {
                a.type = "string";
            }
            else if (columnType.includes("timestamp")) {
                a.type = "date";
            }
            a.nullable = row["Null"] == "YES" ? true : false;
            a.primaryKey = row["Key"].indexOf("PRI") >= 0 ? true : false;
            a.default = row["Default"];
            a.extra = row["Extra"];
            result.push(a);
        });
        return result;
    }
    async run(query, args, connection) {
        let q = null;
        if (typeof query === "string") {
            q = query;
        }
        else if (query instanceof Query.SqlStatement) {
            q = query.eval(this);
            args = query.args;
        }
        let result = new Handler.ResultSet();
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
exports.default = MysqlHandler;
