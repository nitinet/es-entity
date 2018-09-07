"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require("../sql");
class QuerySet {
    constructor(stat, dbSet) {
        this.dbSet = null;
        this.stat = null;
        this.stat = stat;
        this.dbSet = dbSet;
    }
    getEntity(alias) {
        return this.dbSet.getEntity(alias);
    }
    async list() {
        let alias = this.stat.collection.alias;
        this.dbSet.mapping.fields.forEach((field, fieldName) => {
            let c = new sql.Collection();
            c.colAlias = alias;
            c.value = field.name;
            c.alias = fieldName;
            this.stat.columns.push(c);
        });
        let result = await this.dbSet.executeStatement(this.stat);
        return this.mapData(result);
    }
    async select(func) {
        let cols = new Array();
        if (func) {
            let a = this.dbSet.getEntity(this.stat.collection.alias);
            let temp = func(a);
            if (temp instanceof Array) {
                for (let i = 0; i < temp.length; i++) {
                    cols.push(temp[i]._createExpr());
                }
            }
            else {
                cols.push(temp._createExpr());
            }
        }
        else {
            let alias = this.stat.collection.alias;
            await this.dbSet.mapping.fields.forEach((field, fieldName) => {
                let c = new sql.Collection();
                c.colAlias = alias;
                c.value = field.name;
                c.alias = fieldName;
                this.stat.columns.push(c);
            });
        }
        let result = await this.dbSet.executeStatement(this.stat);
        if (result.rows.length == 0)
            throw new Error('No Result Found');
        else {
            return this.mapData(result);
        }
    }
    async unique() {
        let l = await this.list();
        if (l.length > 1) {
            throw new Error('More than one row found in unique call');
        }
        else {
            return l[0];
        }
    }
    where(param, ...args) {
        let res = null;
        if (param instanceof Function) {
            let a = this.dbSet.getEntity(this.stat.collection.alias);
            res = param(a, args);
        }
        else {
            res = param;
        }
        if (res instanceof sql.Expression && res.exps.length > 0) {
            this.stat.where = this.stat.where.add(res);
        }
        return new QuerySet(this.stat, this.dbSet);
    }
    groupBy(param) {
        let a = this.dbSet.getEntity(this.stat.collection.alias);
        let res = null;
        if (param instanceof Function) {
            res = param(a);
        }
        else if (param instanceof Array) {
            res = param;
        }
        if (res instanceof Array) {
            for (let i = 0; i < res.length; i++) {
                if (res[i] instanceof sql.Expression && res[i].exps.length > 0) {
                    this.stat.groupBy.push(res[i]._createExpr());
                }
            }
        }
        else {
            if (res instanceof sql.Expression && res.exps.length > 0) {
                this.stat.groupBy.push(res._createExpr());
            }
        }
        let s = new QuerySet(this.stat, this.dbSet);
        return s;
    }
    orderBy(param) {
        let a = this.dbSet.getEntity(this.stat.collection.alias);
        let res = null;
        if (param instanceof Function) {
            res = param(a);
        }
        else if (param instanceof Array) {
            res = param;
        }
        if (res instanceof Array) {
            for (let i = 0; i < res.length; i++) {
                if (res[i] instanceof sql.Expression && res[i].exps.length > 0) {
                    this.stat.orderBy.push(res[i]._createExpr());
                }
            }
        }
        else {
            if (res instanceof sql.Expression && res.exps.length > 0) {
                this.stat.orderBy.push(res._createExpr());
            }
        }
        let s = new QuerySet(this.stat, this.dbSet);
        return s;
    }
    limit(size, index) {
        this.stat.limit = new sql.Expression(null, sql.Operator.Limit);
        if (index) {
            this.stat.limit.exps.push(new sql.Expression(index.toString()));
        }
        this.stat.limit.exps.push(new sql.Expression(size.toString()));
        let s = new QuerySet(this.stat, this.dbSet);
        return s;
    }
    async mapData(input) {
        let data = new Array();
        let that = this;
        for (let j = 0; j < input.rows.length; j++) {
            let row = input.rows[j];
            let a = this.dbSet.getEntity();
            await this.dbSet.mapping.fields.forEach((field, fieldName) => {
                this.dbSet.setValue(a, fieldName, row[fieldName]);
            });
            await this.dbSet.mapping.foreignRels.forEach((foreignRel) => {
                a[foreignRel].setup(that.dbSet.context, a);
            });
            data.push(a);
        }
        return data;
    }
}
exports.default = QuerySet;
