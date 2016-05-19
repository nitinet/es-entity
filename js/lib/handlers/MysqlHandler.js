/// <reference path="./../../../typings/globals/mysql/index.d.ts" />
"use strict";
const mysql = require("mysql");
const Handler_1 = require("./../Handler");
const Query = require("./../Query");
class MysqlHandler extends Handler_1.default {
    constructor(...args) {
        super(...args);
        this.defaultConnection = null;
    }
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
        let args = null;
        if (typeof query === "string") {
            q = query;
        }
        else if (query instanceof Query.SqlStatement) {
            q = query.eval();
            args = query.args;
        }
        let p = new Promise((resolve, reject) => {
            let r = new Handler_1.ResultSet();
            Promise.resolve(q).then((val) => {
                console.log("query:" + val);
                for (let i = 0; i < args.length; i++) {
                    console.log("Argument: " + args[i]);
                }
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
            });
        });
        return p;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MysqlHandler;
