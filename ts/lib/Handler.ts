import * as Query from "./Sql/Query";

import MysqlHandler from "./handlers/MysqlHandler";

export class ConnectionConfig {
    name: string = "";
    handler: string = "";
    hostname: string = "";  // Default Mysql
    username: string = "";
    password: string = "";
    database: string = "";
}

export class ResultSet {
    rowCount: number = 0;
    rows: Array<any> = null;
    error: string = null;

    constructor() {
    }
}

abstract class Handler {
    static getHandler(config: ConnectionConfig): Handler {
        let handler: Handler = null;
        if (config.handler.toLowerCase() === "mysql")
            handler = new MysqlHandler();
        handler.setconfig(config);
        handler.init();
        return handler;
    }

    public config: ConnectionConfig;

    setconfig(config: ConnectionConfig) {
        this.config = config;
    }

    abstract init(): void;
    abstract getConnection(): any;
    abstract run(query: string | Query.ISqlNode): Promise<ResultSet>;
}

export default Handler;
