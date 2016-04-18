import Query, {QueryType} from "./Query";

import MysqlHandler from "./handlers/MysqlHandler";

class ConnectionConfig {
    name: string = "";
    handler: string = "";
    hostname: string = "";  // Default Mysql
    username: string = "";
    password: string = "";
    database: string = "";
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

    public evalQuery(query: Query): string {
        let res:string="";
        switch (query.type) {
            case QueryType.statement: {
                //res = this.evalStatement(query);
                break;
            }
            default:
                break;
        }
        return res;
    }
    
    abstract init(): void;
    abstract getConnection(): any;
    abstract run(query: string | Query): Promise<any>;

}

export default Handler;
export {ConnectionConfig};