/// <reference path="./../../../typings/main/ambient/mysql/index.d.ts" />
"use strict";
const mysql = require("mysql");
const Handler_1 = require("./../Handler");
class MysqlHandler extends Handler_1.default {
    init() {
        this.defaultConnection = mysql.createConnection({
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
        return connection;
    }
    run(query) {
        let q = "";
        if (typeof query === "string") {
            q = query;
        }
        else if (typeof query === "Query") {
            q = this.parse(query);
        }
        let p = new Promise((res, rej) => {
            this.defaultConnection.connect(function (err) {
                if (err)
                    rej();
                else
                    res();
            });
        });
        p.then(() => {
            this.defaultConnection.query(q, function (err, rows, fields) {
                if (err)
                    throw err;
                else
                    return rows;
            });
        });
        return p;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MysqlHandler;
