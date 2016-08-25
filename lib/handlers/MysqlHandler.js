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
const Handler_1 = require("./../Handler");
const Query = require("./../Query");
class MysqlHandler extends Handler_1.default {
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
    run(query, connection) {
        return __awaiter(this, void 0, Promise, function* () {
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
                    let r = new Handler_1.ResultSet();
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
