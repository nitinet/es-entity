"use strict";
const MysqlHandler_1 = require("./handlers/MysqlHandler");
class ConnectionConfig {
    constructor() {
        this.name = "";
        this.handler = "";
        this.hostname = ""; // Default Mysql
        this.username = "";
        this.password = "";
        this.database = "";
    }
}
exports.ConnectionConfig = ConnectionConfig;
class Handler {
    static getHandler(config) {
        let handler = null;
        if (config.handler.toLowerCase() === "mysql")
            handler = new MysqlHandler_1.default();
        handler.setconfig(config);
        handler.init();
        return handler;
    }
    setconfig(config) {
        this.config = config;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Handler;
