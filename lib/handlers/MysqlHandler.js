"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const mysql = require("mysql");
const Handler = require("./../Handler");
const Query = require("./../Query");
class MysqlHandler extends Handler.default {
    constructor(config) {
        super();
        this.connectionPool = null;
        this.config = config;
        this.connectionPool = mysql.createPool({
            connectionLimit: this.config.connectionLimit,
            host: this.config.hostname,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });
    }
    getConnection() {
        let connection = mysql.createConnection({
            host: this.config.hostname,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });
        connection.connect(function (err) {
            if (err)
                throw err;
            else
                return;
        });
        return connection;
    }
    getTableInfo(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            let r = yield this.run("describe " + tableName);
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
                else if (columnType.includes("varchar")) {
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
        });
    }
    run(query, connection) {
        return __awaiter(this, void 0, void 0, function* () {
            let q = null;
            let args = null;
            if (typeof query === "string") {
                q = query;
            }
            else if (query instanceof Query.SqlStatement) {
                q = query.eval();
                args = query.args;
            }
            let p = new Promise((resolve, reject) => {
                return Promise.resolve(q).then((val) => {
                    let r = new Handler.ResultSet();
                    if (connection) {
                        connection.query(val, args, function (err, result) {
                            if (err)
                                reject(err.code);
                            else {
                                if (result.insertId)
                                    r.id = result.insertId;
                                if (result.changedRows) {
                                    r.rowCount = result.changedRows;
                                }
                                else if (Array.isArray(result)) {
                                    r.rows = result;
                                    r.rowCount = result.length;
                                }
                            }
                            resolve(r);
                        });
                    }
                    else {
                        this.connectionPool.query(val, args, function (err, result) {
                            if (err)
                                reject(err.code);
                            else {
                                if (result.insertId)
                                    r.id = result.insertId;
                                if (result.changedRows) {
                                    r.rowCount = result.changedRows;
                                }
                                else if (Array.isArray(result)) {
                                    r.rows = result;
                                    r.rowCount = result.length;
                                }
                            }
                            resolve(r);
                        });
                    }
                });
            });
            return p;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MysqlHandler;
