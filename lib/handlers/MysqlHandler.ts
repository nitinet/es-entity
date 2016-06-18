/// <reference path="/usr/local/lib/typings/globals/mysql/index.d.ts" />

import * as mysql from "mysql";

import Handler, {ResultSet, ConnectionConfig} from "./../Handler";
import * as Query from "./../Query";

class MysqlHandler extends Handler {
    connectionPool: mysql.IPool = null;

    constructor(config: ConnectionConfig) {
        super();
        this.config = config;
        this.connectionPool = mysql.createPool({
            connectionLimit: this.config.connectionLimit,
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

    run(query: string | Query.ISqlNode, connection?: any): Promise<ResultSet> {
        let q: string = null;
        let args: Array<any> = null;
        if (typeof query === "string") {
            q = query;
        } else if (query instanceof Query.SqlStatement) {
            q = query.eval();
            args = query.args;
        }

        let p = new Promise<ResultSet>((resolve, reject) => {
            let r: ResultSet = new ResultSet();
            Promise.resolve<string>(q).then((val) => {
                // console.log("query:" + val);
                /* for (let i = 0; i < args.length; i++) {
                    console.log("Argument: " + args[i]);
                }*/
                if (connection) {
                    (<mysql.IConnection>connection).query(val, args, function (err, result) {
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
                } else {
                    this.connectionPool.query(val, args, function (err, result) {
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
                }
            });
        });
        return p;
    }

}

export default MysqlHandler;