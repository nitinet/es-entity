/// <reference path="./../../../typings/main/ambient/mysql/index.d.ts" />

import mysql = require("mysql");

import Handler from "./../Handler";
import Query from "./../Query";

class MysqlHandler extends Handler {

    defaultConnection: mysql.IConnection;

    init(): void {
        this.defaultConnection = mysql.createConnection({
            host: this.config.hostname,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });
    }

    getConnection(): any {
        let connection = mysql.createConnection({
            host: this.config.hostname,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });
        return connection;
    }

    run(query: string | Query): Promise<any> {
        let q = "";
        if (typeof query === "string") {
            q = query;
        } else if (typeof query === "Query") {
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

export default MysqlHandler;