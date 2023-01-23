import * as bean from './bean/index.js';
import getHandler from './handlers/getHandler.js';
import TableSet from './collection/TableSet.js';
export default class Context {
    _handler;
    connection = null;
    logger = null;
    tableSetMap = new Map();
    config;
    constructor(config) {
        this.config = config;
        if (!this.config.dbConfig) {
            throw new Error('Database Config Not Found');
        }
        this._handler = getHandler(this.config.dbConfig);
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
    }
    async execute(query, args) {
        return this.handler.run(query, args);
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
        let nativeConn = await res.handler.getConnection();
        res.connection = new bean.Connection(res.handler, nativeConn);
        await res.connection.initTransaction();
        return res;
    }
    async commit() {
        if (!this.connection)
            throw new TypeError('Transaction Not Started');
        await this.connection.commit();
        await this.connection.close();
    }
    async rollback() {
        if (!this.connection)
            throw new TypeError('Transaction Not Started');
        await this.connection.rollback();
        await this.connection.close();
    }
    end() {
        return this.handler.end();
    }
}
//# sourceMappingURL=Context.js.map