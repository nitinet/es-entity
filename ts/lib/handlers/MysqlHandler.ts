/// <reference path="./../../../typings/main/ambient/mysql/index.d.ts" />

// import mysql = require("mysql");

import Handler, {ResultSet} from "./../Handler";
import * as Query from "./../Sql/Query";

class MysqlHandler extends Handler {

    defaultConnection: any = null;
    driver: any = null;

    init(): void {
        this.driver = this.config.driver;

        this.defaultConnection = this.driver.createConnection({
            host: this.config.hostname,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });
    }

    getConnection(): any {
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

    run(query: string | Query.ISqlNode, connection = this.defaultConnection): Promise<ResultSet> {
        let q: any = null;
        if (typeof query === "string") {
            q = query;
        } else if (query instanceof Query.SqlStatement) {
            q = query.eval();
        }

        let p = new Promise<ResultSet>((resolve, reject) => {
            let r: ResultSet = new ResultSet();
            Promise.resolve(q).then((val) => {
                connection.query(val, function (err, result, fields) {
                    if (err)
                        reject(err.code);
                    else {
                        if (result.insertId)
                            r.id = result.insertId;
                         if (result.changedRows) {
                            r.rowCount = result.changedRows;
                         } else if (Array.isArray(result)) {
                            r.rows = <Array<any>>result;
                            r.rowCount = (<Array<any>>result).length;
                        }
                    }
                    resolve(r);
                });
            });
        });
        return p;
    }

}

export default MysqlHandler;