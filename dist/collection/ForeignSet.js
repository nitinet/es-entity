"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IQuerySet_1 = require("./IQuerySet");
class ForeignSet extends IQuerySet_1.default {
    constructor(entityType, foreignFunc) {
        super();
        this.foreignFunc = null;
        this.dbSet = null;
        this.entityType = entityType;
        this.foreignFunc = foreignFunc;
    }
    setup(context, parent) {
        this.context = context;
        this.dbSet = this.context.dbSetMap.get(this.entityType).where(this.foreignFunc, parent);
    }
    getEntity(alias) {
        return this.dbSet.getEntity(alias);
    }
    list() {
        return this.dbSet.list();
    }
    unique() {
        return this.dbSet.unique();
    }
    run() {
        return this.dbSet.run();
    }
    select(param) {
        return this.dbSet.select(param);
    }
    where(func, ...args) {
        return this.dbSet.where(func, args);
    }
    groupBy(func) {
        return this.dbSet.groupBy(func);
    }
    orderBy(func) {
        return this.orderBy(func);
    }
    limit(size, index) {
        return this.limit(size, index);
    }
    mapData(input) {
        return this.dbSet.mapData(input);
    }
    join(coll, param, joinType) {
        let q = this.where();
        return q.join(coll, param);
    }
}
exports.default = ForeignSet;
//# sourceMappingURL=ForeignSet.js.map