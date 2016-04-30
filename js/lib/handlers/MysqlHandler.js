/// <reference path="./../../../typings/main/ambient/mysql/index.d.ts" />
"use strict";
const mysql = require("mysql");
const Handler_1 = require("./../Handler");
const Query = require("./../Sql/Query");
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
        let p = Promise.race(q).then((val) => {
            connection.query(val, function (err, rows, fields) {
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
