"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ForeignSet {
    constructor(entityType, foreignFunc) {
        this.foreignFunc = null;
        this.context = null;
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
}
exports.default = ForeignSet;
