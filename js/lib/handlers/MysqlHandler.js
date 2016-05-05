/// <reference path="./../../../typings/main/ambient/mysql/index.d.ts" />
"use strict";
// import mysql = require("mysql");
const Handler_1 = require("./../Handler");
const Query = require("./../Sql/Query");
class MysqlHandler extends Handler_1.default {
    constructor(...args) {
        super(...args);
        this.defaultConnection = null;
        this.driver = null;
    }
    init() {
        this.driver = this.config.driver;
        this.defaultConnection = this.driver.createConnection({
            host: this.config.hostname,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });
    }
    getConnection() {
        let connection = this.driver.createConnection({
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
    run(query, connection = this.defaultConnection) {
        let q = null;
        if (typeof query === "string") {
            q = query;
        }
        else if (query instanceof Query.SqlStatement) {
            q = query.eval();
        }
        let p = new Promise((resolve, reject) => {
            let r = new Handler_1.ResultSet();
            Promise.resolve(q).then((val) => {
                connection.query(val, function (err, result, fields) {
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
            });
        });
        return p;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MysqlHandler;
