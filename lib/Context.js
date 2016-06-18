/// <reference path="/usr/local/lib/typings/globals/node/index.d.ts" />
"use strict";
const Queryable_1 = require("./Queryable");
const MysqlHandler_1 = require("./handlers/MysqlHandler");
const OracleDbHandler_1 = require("./handlers/OracleDbHandler");
const MsSqlServerHandler_1 = require("./handlers/MsSqlServerHandler");
const PostGreHandler_1 = require("./handlers/PostGreHandler");
const SqlLiteHandler_1 = require("./handlers/SqlLiteHandler");
function getHandler(config) {
    let handler = null;
    if (config.handler.toLowerCase() === "mysql") {
        handler = new MysqlHandler_1.default(config);
    }
    else if (config.handler.toLowerCase() === "oracle") {
        handler = new OracleDbHandler_1.default(config);
    }
    else if (config.handler.toLowerCase() === "postgre") {
        handler = new PostGreHandler_1.default(config);
    }
    else if (config.handler.toLowerCase() === "sqlserver") {
        handler = new MsSqlServerHandler_1.default(config);
    }
    else if (config.handler.toLowerCase() === "sqllite") {
        handler = new SqlLiteHandler_1.default(config);
    }
    else {
        throw "No Handler Found";
    }
    return handler;
}
exports.getHandler = getHandler;
class Context {
    constructor(config, entityPath) {
        if (config) {
            this.setConfig(config);
        }
        if (entityPath) {
            this.setEntityPath(entityPath);
        }
    }
    init() {
        let keys = Reflect.ownKeys(this);
        keys.forEach(key => {
            let e = Reflect.get(this, key);
            if (e instanceof Queryable_1.DBSet) {
                e.bind(this);
            }
        });
    }
    setConfig(config) {
        this.handler = getHandler(config);
    }
    setEntityPath(entityPath) {
        this.entityPath = entityPath;
    }
    execute(query) {
        return this.handler.run(query);
    }
    flush() { }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Context;
