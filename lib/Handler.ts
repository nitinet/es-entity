import * as Query from "./Query";

export class ConnectionConfig {
    name: string = "";
    handler: string = "";
    driver: any = null;
    hostname: string = "";  // Default Mysql
    username: string = "";
    password: string = "";
    database: string = "";
}

export class ResultSet {
    rowCount: number = 0;
    id: any = null;
    rows: Array<any> = null;
    error: string = null;

    constructor() {
    }
}

abstract class Handler {
    public config: ConnectionConfig;

    setconfig(config: ConnectionConfig) {
        this.config = config;
    }

    abstract init(): void;
    abstract getConnection(): any;
    abstract run(query: string | Query.ISqlNode): Promise<ResultSet>;
}

export default Handler;
