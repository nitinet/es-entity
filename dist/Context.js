import getHandler from './handlers/getHandler.js';
import TableSet from './collection/TableSet.js';
export default class Context {
    _handler;
    _entityPath;
    connection = null;
    logger = null;
    tableSetMap = new Map();
    config = null;
    constructor(config) {
        this.config = config;
        if (!this.config.dbConfig) {
            throw new Error('Database Config Not Found');
        }
        this.handler = getHandler(this.config.dbConfig);
        if (this.config.entityPath) {
            this.setEntityPath(this.config.entityPath);
        }
        this.logger = this.config.logger || console;
    }
    log(...arg) {
        this.logger.error(arg);
    }
    async init() {
        await this.handler.init();
        await Promise.all(Reflect.ownKeys(this).filter(key => {
            let o = Reflect.get(this, key);
            return o instanceof TableSet;
        }, this).map(async (key) => {
            let table = Reflect.get(this, key);
            table.context = this;
            await table.bind();
            this.tableSetMap.set(table.getEntityType(), table.dbSet);
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
        return this.handler.run(query, args, this.connection);
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
                if (prop instanceof TableSet) {
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
