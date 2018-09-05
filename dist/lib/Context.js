"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collection_1 = require("./collection");
const sql = require("./sql");
const Mysql_1 = require("../handlers/Mysql");
const OracleDb_1 = require("../handlers/OracleDb");
const MsSqlServer_1 = require("../handlers/MsSqlServer");
const PostGreSql_1 = require("../handlers/PostGreSql");
const SqlLite_1 = require("../handlers/SqlLite");
function getHandler(config) {
    let handler = null;
    if (config.handler.toLowerCase() === 'mysql') {
        handler = new Mysql_1.default(config);
    }
    else if (config.handler.toLowerCase() === 'oracle') {
        handler = new OracleDb_1.default(config);
    }
    else if (config.handler.toLowerCase() === 'postgresql') {
        handler = new PostGreSql_1.default(config);
    }
    else if (config.handler.toLowerCase() === 'sqlserver') {
        handler = new MsSqlServer_1.default(config);
    }
    else if (config.handler.toLowerCase() === 'sqllite') {
        handler = new SqlLite_1.default(config);
    }
    else {
        throw 'No Handler Found';
    }
    return handler;
}
class Context {
    constructor(config, entityPath) {
        this.connection = null;
        this.logger = null;
        this.dbSetMap = new Map();
        if (config) {
            this.setConfig(config);
        }
        if (entityPath) {
            this.setEntityPath(entityPath);
        }
    }
    setLogger(logger) {
        this.logger = logger;
    }
    log(arg) {
        if (this.logger) {
            this.logger.trace(arg);
        }
    }
    init() {
        let keys = Reflect.ownKeys(this);
        let ps = new Array();
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let o = Reflect.get(this, key);
            if (o instanceof collection_1.DBSet) {
                ps.push(o.bind(this));
                this.dbSetMap.set(o.getEntityType(), o);
            }
        }
        return Promise.all(ps);
    }
    setConfig(config) {
        this.handler = getHandler(config);
        this.handler.context = this;
    }
    get handler() {
        return this._handler;
    }
    set handler(handler) {
        this._handler = handler;
        this._handler.context = this;
    }
    getEntityPath() {
        return this.entityPath;
    }
    setEntityPath(entityPath) {
        this.entityPath = entityPath;
    }
    async execute(query, args) {
        return await this.handler.run(query, args, this.connection);
    }
    getCriteria() {
        return new sql.Expression();
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
}
exports.default = Context;
