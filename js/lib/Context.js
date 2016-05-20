/// <reference path="./../../typings/globals/node/index.d.ts" />
"use strict";
const Queryable_1 = require("./Queryable");
const MysqlHandler_1 = require("./handlers/MysqlHandler");
function getHandler(config) {
    let handler = null;
    if (config.handler.toLowerCase() === "mysql")
        handler = new MysqlHandler_1.default();
    handler.setconfig(config);
    handler.init();
    return handler;
}
exports.getHandler = getHandler;
class Context {
    constructor() {
    }
    setConfig(config) {
        this.handler = getHandler(config);
    }
    bind(config, mappingPath) {
        this.mappingPath = mappingPath;
        this.setConfig(config);
        let keys = Reflect.ownKeys(this);
        keys.forEach(key => {
            let e = Reflect.get(this, key);
            if (e instanceof Queryable_1.DBSet) {
                e.bind(this);
            }
        });
    }
    execute(query) {
        return this.handler.run(query);
    }
    flush() { }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Context;
