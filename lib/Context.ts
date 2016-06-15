/// <reference path="/usr/local/lib/typings/globals/node/index.d.ts" />

import Queryable, {DBSet} from "./Queryable";
import Handler, {ConnectionConfig, ResultSet} from "./Handler";
import MysqlHandler from "./handlers/MysqlHandler";
import OracleHandler from "./handlers/OracleDbHandler";
import MsSqlServerHandler from "./handlers/MsSqlServerHandler";
import PostGreHandler from "./handlers/PostGreHandler";
import SqlLiteHandler from "./handlers/SqlLiteHandler";
import * as Query from "./Query";

export function getHandler(config: ConnectionConfig): Handler {
    let handler: Handler = null;
    if (config.handler.toLowerCase() === "mysql") {
        handler = new MysqlHandler();
    } else if (config.handler.toLowerCase() === "oracle") {
        handler = new OracleHandler();
    } else if (config.handler.toLowerCase() === "postgre") {
        handler = new PostGreHandler();
    } else if (config.handler.toLowerCase() === "sqlserver") {
        handler = new MsSqlServerHandler();
    } else if (config.handler.toLowerCase() === "sqllite") {
        handler = new SqlLiteHandler();
    } else {
        throw "No Handler Found";
    }
    handler.setconfig(config);
    handler.init();
    return handler;
}

class Context {
    mappingPath: string;
    handler: Handler;

    constructor() {
    }

    setConfig(config: ConnectionConfig): void {
        this.handler = getHandler(config);
    }

    bind(config?: ConnectionConfig, mappingPath?: string): void {
        this.mappingPath = mappingPath;
        this.setConfig(config);
        let keys: (string | number | symbol)[] = Reflect.ownKeys(this);
        keys.forEach(key => {
            let e: any = Reflect.get(this, key);
            if (e instanceof DBSet) {
                (<DBSet<any>>e).bind(this);
            }
        });
    }

    execute(query: string | Query.ISqlNode): Promise<ResultSet> {
        return this.handler.run(query);
    }

    flush(): void { }

}

export default Context;