"use strict";
class ConnectionConfig {
    constructor() {
        this.name = "";
        this.handler = "";
        this.driver = null;
        this.connectionLimit = 25;
        this.hostname = ""; // Default Mysql
        this.username = "";
        this.password = "";
        this.database = "";
    }
}
exports.ConnectionConfig = ConnectionConfig;
class ResultSet {
    constructor() {
        this.rowCount = 0;
        this.id = null;
        this.rows = null;
        this.error = null;
    }
}
exports.ResultSet = ResultSet;
class Handler {
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Handler;
