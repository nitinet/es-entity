/// <reference path="./../../typings/main/ambient/node/index.d.ts" />

import Queryable from "./Queryable";
import Handler, {ConnectionConfig, ResultSet} from "./Handler";
import MysqlHandler from "./handlers/MysqlHandler";
import * as Query from "./Sql/Query";

export function getHandler(config: ConnectionConfig): Handler {
    let handler: Handler = null;
    if (config.handler.toLowerCase() === "mysql")
        handler = new MysqlHandler();
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
            if (e instanceof Queryable) {
                (<Queryable<any>>e).bind(this);
            }
        });
    }

    execute(query: string | Query.ISqlNode): Promise<ResultSet> {
        return this.handler.run(query);
    }

    flush(): void { }

}

export default Context;
