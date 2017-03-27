"use strict";
const Queryable_1 = require("./Queryable");
const MysqlHandler_1 = require("./handlers/MysqlHandler");
const OracleDbHandler_1 = require("./handlers/OracleDbHandler");
const MsSqlServerHandler_1 = require("./handlers/MsSqlServerHandler");
const PostGreHandler_1 = require("./handlers/PostGreHandler");
const SqlLiteHandler_1 = require("./handlers/SqlLiteHandler");
const Query = require("./Query");
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
        this.connection = null;
        if (config) {
            this.setConfig(config);
        }
        if (entityPath) {
            this.setEntityPath(entityPath);
        }
    }
    async init() {
        let keys = Reflect.ownKeys(this);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let e = Reflect.get(this, key);
            if (e instanceof Queryable_1.DBSet) {
                await e.bind(this);
            }
        }
    }
    setConfig(config) {
        this.handler = getHandler(config);
    }
    setEntityPath(entityPath) {
        this.entityPath = entityPath;
    }
    async execute(query, args) {
        return await this.handler.run(query, args, this.connection);
    }
    getCriteria() {
        return new Query.SqlExpression();
    }
    flush() { }
    async initTransaction() {
        let res = this;
        if (!this.connection) {
            res = Object.assign({}, this);
            Object.setPrototypeOf(res, Object.getPrototypeOf(this));
            let keys = Reflect.ownKeys(res);
            keys.forEach((key) => {
                let prop = Reflect.get(res, key);
                if (prop instanceof Queryable_1.DBSet) {
                    prop.context = res;
                }
            });
        }
        res.connection = await res.handler.getConnection();
        await res.connection.initTransaction();
        return res;
    }
    async commit() {
        await this.connection.commit();
        await this.connection.close();
    }
    async rollback() {
        await this.connection.rollback();
        await this.connection.close();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Context;
