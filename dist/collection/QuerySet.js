"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require("../sql");
const IQuerySet_1 = require("./IQuerySet");
const JoinQuerySet_1 = require("./JoinQuerySet");
class QuerySet extends IQuerySet_1.default {
    constructor(dbSet) {
        super();
        this.dbSet = null;
        this.alias = null;
        this.dbSet = dbSet;
        this.context = this.dbSet.context;
        this.stat = new sql.Statement();
        this.alias = dbSet.mapping.name.charAt(0);
        this.stat.collection.value = dbSet.mapping.name;
        this.stat.collection.alias = this.alias;
    }
    getEntity(alias) {
        alias = alias || this.stat.collection.alias;
        return this.dbSet.getEntity(alias);
    }
    async list() {
        this.select();
        let result = await this.context.execute(this.stat);
        return this.mapData(result);
    }
    async mapData(input) {
        return this.dbSet.mapData(input);
    }
    async run() {
        if (!this.stat.columns.length) {
            return this.list();
        }
        let result = await this.context.execute(this.stat);
        return result.rows;
    }
    select(param) {
        this.stat.command = sql.Command.SELECT;
        if (param) {
            let a = this.getEntity();
            let temp = [];
            if (param instanceof Function) {
                param = param(a);
            }
            if (param instanceof sql.Expression) {
                temp.push(param);
            }
            else if (param instanceof Array) {
                temp = temp.concat(param);
            }
            temp.forEach(val => {
                this.stat.columns.push(val);
            });
        }
        else {
            let alias = this.stat.collection.alias;
            this.dbSet.mapping.fields.forEach((field) => {
                let c = new sql.Collection();
                c.colAlias = alias;
                c.value = field.colName;
                c.alias = field.fieldName;
                this.stat.columns.push(c);
            });
        }
        return this;
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
        if (param) {
            if (param instanceof Function) {
                let a = this.getEntity();
                res = param(a, args);
            }
            else {
                res = param;
            }
        }
        if (res && res instanceof sql.Expression && res.exps.length > 0) {
            this.stat.where = this.stat.where.add(res);
        }
        return this;
    }
    groupBy(param) {
        let res = null;
        if (param) {
            if (param instanceof Function) {
                let a = this.getEntity();
                res = param(a);
            }
            else if (param instanceof Array) {
                res = param;
            }
        }
        if (res) {
            if (res instanceof Array) {
                res.forEach(a => {
                    if (a instanceof sql.Expression && a.exps.length > 0) {
                        this.stat.groupBy.push(a);
                    }
                });
            }
            else if (res instanceof sql.Expression && res.exps.length > 0) {
                this.stat.groupBy.push(res);
            }
        }
        return this;
    }
    orderBy(param) {
        let res = null;
        if (param) {
            if (param instanceof Function) {
                let a = this.getEntity();
                res = param(a);
            }
            else if (param instanceof Array) {
                res = param;
            }
        }
        if (res) {
            if (res instanceof Array) {
                res.forEach(a => {
                    if (a instanceof sql.Expression && a.exps.length > 0) {
                        this.stat.orderBy.push(a);
                    }
                });
            }
            else if (res instanceof sql.Expression && res.exps.length > 0) {
                this.stat.orderBy.push(res);
            }
        }
        return this;
    }
    limit(size, index) {
        this.stat.limit = new sql.Expression(null, sql.Operator.Limit);
        if (index) {
            this.stat.limit.exps.push(new sql.Expression(index.toString()));
        }
        this.stat.limit.exps.push(new sql.Expression(size.toString()));
        return this;
    }
    join(coll, param, joinType) {
        joinType = joinType | sql.Join.InnerJoin;
        let temp = null;
        if (param) {
            if (param instanceof Function) {
                let a = this.getEntity();
                let b = coll.getEntity();
                temp = param(a, b);
            }
            else {
                temp = param;
            }
        }
        if (temp && temp instanceof sql.Expression && temp.exps.length > 0) {
            let res = new JoinQuerySet_1.default(this, coll, joinType, temp);
            return res;
        }
        else {
            throw 'Invalid Join';
        }
    }
}
exports.default = QuerySet;
//# sourceMappingURL=QuerySet.js.map