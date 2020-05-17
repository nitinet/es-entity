import * as sql from '../sql';
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
    async select(param) {
        if (param) {
            let a = this.dbSet.getEntity(this.stat.collection.alias);
            let temp = [];
            if (typeof param == 'function') {
                param = param(a);
            }
            if (param instanceof sql.Expression) {
                temp.push(param);
            }
            else if (param instanceof Array) {
                temp = temp.concat(param);
            }
            temp.forEach(val => {
                this.stat.columns.push(val.expr());
            });
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
        return result.rows;
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
                    this.stat.groupBy.push(res[i].expr());
                }
            }
        }
        else {
            if (res instanceof sql.Expression && res.exps.length > 0) {
                this.stat.groupBy.push(res.expr());
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
                    this.stat.orderBy.push(res[i].expr());
                }
            }
        }
        else {
            if (res instanceof sql.Expression && res.exps.length > 0) {
                this.stat.orderBy.push(res.expr());
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
export default QuerySet;
//# sourceMappingURL=QuerySet.js.map