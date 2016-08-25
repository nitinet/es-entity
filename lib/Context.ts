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
        handler = new MysqlHandler(config);
    } else if (config.handler.toLowerCase() === "oracle") {
        handler = new OracleHandler(config);
    } else if (config.handler.toLowerCase() === "postgre") {
        handler = new PostGreHandler(config);
    } else if (config.handler.toLowerCase() === "sqlserver") {
        handler = new MsSqlServerHandler(config);
    } else if (config.handler.toLowerCase() === "sqllite") {
        handler = new SqlLiteHandler(config);
    } else {
        throw "No Handler Found";
    }
    return handler;
}

class Context {
    entityPath: string;
    handler: Handler;

    constructor(config?: ConnectionConfig, entityPath?: string) {
        if (config) {
            this.setConfig(config);
        }
        if (entityPath) {
            this.setEntityPath(entityPath);
        }
    }

    init() {
        let keys: (string | number | symbol)[] = Reflect.ownKeys(this);
        keys.forEach(key => {
            let e: any = Reflect.get(this, key);
            if (e instanceof DBSet) {
                (<DBSet<any>>e).bind(this);
            }
        });
    }

    setConfig(config: ConnectionConfig): void {
        this.handler = getHandler(config);
    }

    setEntityPath(entityPath: string): void {
        this.entityPath = entityPath;
    }

    async execute(query: string | Query.ISqlNode): Promise<ResultSet> {
        return this.handler.run(query);
    }

    flush(): void { }

}

export default Context;
