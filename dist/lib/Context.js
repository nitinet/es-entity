import { DBSet } from './collection';
import * as bean from '../bean/index';
import Mysql from '../handlers/Mysql';
import OracleHandler from '../handlers/Oracle';
import MsSqlServer from '../handlers/MsSqlServer';
import PostgreSql from '../handlers/PostGreSql';
import SQLite from '../handlers/SQLite';
import Cassandra from '../handlers/Cassandra';
function getHandler(config) {
    let handler = null;
    switch (config.handler) {
        case bean.HandlerType.mysql:
            handler = new Mysql(config);
            break;
        case bean.HandlerType.oracle:
            handler = new OracleHandler(config);
            break;
        case bean.HandlerType.postgresql:
            handler = new PostgreSql(config);
            break;
        case bean.HandlerType.mssql:
            handler = new MsSqlServer(config);
            break;
        case bean.HandlerType.sqlite:
            handler = new SQLite(config);
            break;
        case bean.HandlerType.cassandra:
            handler = new Cassandra(config);
            break;
        default:
            throw 'No Handler Found';
    }
    return handler;
}
export default class Context {
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
    async init() {
        await this.handler.init();
        let keys = Reflect.ownKeys(this);
        let ps = new Array();
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let o = Reflect.get(this, key);
            if (o instanceof DBSet) {
                ps.push(o.bind(this));
                this.dbSetMap.set(o.getEntityType(), o);
            }
        }
        return Promise.all(ps);
    }
    setConfig(config) {
        this.handler = getHandler(config);
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
    flush() { }
    async initTransaction() {
        let res = this;
        if (!this.connection) {
            res = Object.assign({}, this);
            Object.setPrototypeOf(res, Object.getPrototypeOf(this));
            let keys = Reflect.ownKeys(res);
            keys.forEach((key) => {
                let prop = Reflect.get(res, key);
                if (prop instanceof DBSet) {
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
//# sourceMappingURL=Context.js.map