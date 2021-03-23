"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collection_1 = require("./collection");
const bean = require("./bean");
const Mysql_1 = require("./handlers/Mysql");
const Oracle_1 = require("./handlers/Oracle");
const MsSqlServer_1 = require("./handlers/MsSqlServer");
const PostGreSql_1 = require("./handlers/PostGreSql");
const SQLite_1 = require("./handlers/SQLite");
const Cassandra_1 = require("./handlers/Cassandra");
function getHandler(config) {
    let handler = null;
    switch (config.handler) {
        case bean.HandlerType.mysql:
            handler = new Mysql_1.default(config);
            break;
        case bean.HandlerType.oracle:
            handler = new Oracle_1.default(config);
            break;
        case bean.HandlerType.postgresql:
            handler = new PostGreSql_1.default(config);
            break;
        case bean.HandlerType.mssql:
            handler = new MsSqlServer_1.default(config);
            break;
        case bean.HandlerType.sqlite:
            handler = new SQLite_1.default(config);
            break;
        case bean.HandlerType.cassandra:
            handler = new Cassandra_1.default(config);
            break;
        default:
            throw 'No Handler Found';
    }
    return handler;
}
class Context {
    constructor(config) {
        this.connection = null;
        this.logger = null;
        this.dbSetMap = new Map();
        this.config = null;
        this.config = config;
        if (!this.config.dbConfig) {
            throw new Error('Database Config Not Found');
        }
        this.handler = getHandler(this.config.dbConfig);
        if (this.config.entityPath) {
            this.setEntityPath(this.config.entityPath);
        }
        if (this.config.logger) {
            this.logger = this.config.logger;
        }
    }
    log(...arg) {
        if (this.logger) {
            this.logger.error(arg);
        }
    }
    async init() {
        await this.handler.init();
        await Promise.all(Reflect.ownKeys(this).filter(key => {
            let o = Reflect.get(this, key);
            return o instanceof collection_1.DBSet;
        }, this).map(key => {
            let obj = Reflect.get(this, key);
            obj.context = this;
            obj.bind();
            this.dbSetMap.set(obj.getEntityType(), obj);
        }));
    }
    get handler() {
        return this._handler;
    }
    set handler(handler) {
        this._handler = handler;
        this._handler.context = this;
    }
    getEntityPath() {
        return this._entityPath;
    }
    setEntityPath(entityPath) {
        this._entityPath = entityPath;
    }
    async execute(query, args) {
        return await this.handler.run(query, args, this.connection);
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
                if (prop instanceof collection_1.DBSet) {
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
    end() {
        return this.handler.end();
    }
}
exports.default = Context;
//# sourceMappingURL=Context.js.map