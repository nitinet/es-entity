/// <reference path="./../../../typings/main/ambient/mysql/index.d.ts" />

import mysql = require("mysql");

import Handler from "./../Handler";
import * as Query from "./../Sql/Query";

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
        connection.connect(function (err) {
            if (err)
                throw err;
            else
                return;
        });
        return connection;
    }

    run(query: string | Query.ISqlNode, connection = this.defaultConnection): Promise<any> {
        let q: any = null;
        if (typeof query === "string") {
            q = query;
        } else if (query instanceof Query.SqlStatement) {
            q = query.eval();
        }
        let p = Promise.race<string>(q).then((val: string) => {
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

export default MysqlHandler;