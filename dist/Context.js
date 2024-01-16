import { cloneDeep } from 'lodash';
import * as bean from './bean/index.js';
import TableSet from './collection/TableSet.js';
import getHandler from './handlers/getHandler.js';
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
        Reflect.ownKeys(this).forEach(key => {
            let tableSet = Reflect.get(this, key);
            if (!(tableSet instanceof TableSet))
                return;
            tableSet.context = this;
            this.tableSetMap.set(tableSet.getEntityType(), tableSet);
        });
    }
    get handler() {
        return this._handler;
    }
    set handler(handler) {
        this._handler = handler;
    }
    async execute(query) {
        if (this.connection) {
            return this.connection.run(query);
        }
        else {
            return this.handler.run(query);
        }
    }
    flush() { }
    async initTransaction() {
        let res = cloneDeep(this);
        let keys = Reflect.ownKeys(res);
        keys.forEach((key) => {
            let prop = Reflect.get(res, key);
            if (prop instanceof TableSet) {
                prop.context = res;
            }
        });
        let nativeConn = await this.handler.getConnection();
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