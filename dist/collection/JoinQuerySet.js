import IQuerySet from './IQuerySet.js';
import * as sql from '../sql/index.js';
class JoinQuerySet extends IQuerySet {
    mainSet = null;
    joinSet = null;
    constructor(mainSet, joinSet, joinType, expr) {
        super();
        this.mainSet = mainSet;
        this.context = mainSet.context;
        this.joinSet = joinSet;
        this.stat = new sql.Statement();
        this.stat.collection.leftColl = this.mainSet.stat.collection;
        this.stat.collection.rightColl = this.joinSet.stat.collection;
        this.stat.collection.join = joinType;
        this.stat.where = this.stat.where.add(expr);
    }
    getEntity() {
        return null;
    }
    async list() {
        return null;
    }
    async mapData(input) {
        return null;
    }
    select(TargetType) {
        return null;
    }
    selectPlain(keys) {
        return null;
    }
    where(param, ...args) {
        let res = null;
        if (param && param instanceof Function) {
            let a = new sql.OperatorEntity();
            res = param(a, args);
        }
        if (res && res instanceof sql.Expression && res.exps.length > 0) {
            this.stat.where = this.stat.where.add(res);
        }
        return this;
    }
    groupBy(param) {
        let res = null;
        if (param && param instanceof Function) {
            let a = new sql.OperatorEntity();
            res = param(a);
        }
        if (res && Array.isArray(res)) {
            res.forEach(a => {
                if (a instanceof sql.Expression && a.exps.length > 0) {
                    this.stat.groupBy.push(a);
                }
            });
        }
        return this;
    }
    orderBy(param) {
        let res = null;
        if (param && param instanceof Function) {
            let a = new sql.OperatorEntity();
            res = param(a);
        }
        if (res && Array.isArray(res)) {
            res.forEach(a => {
                if (a instanceof sql.Expression && a.exps.length > 0) {
                    this.stat.orderBy.push(a);
                }
            });
        }
        return this;
    }
    limit(size, index) {
        this.stat.limit = new sql.Expression(null, sql.types.Operator.Limit);
        this.stat.limit.exps.push(new sql.Expression(size.toString()));
        if (index) {
            this.stat.limit.exps.push(new sql.Expression(index.toString()));
        }
        return this;
    }
    join(coll, param, joinType) {
        joinType = joinType || sql.types.Join.InnerJoin;
        let temp = null;
        if (param && param instanceof Function) {
            let a = this.getEntity();
            let b = coll.getEntity();
            temp = param(a, b);
        }
        let res = null;
        if (temp instanceof sql.Expression && temp.exps.length > 0) {
            res = new JoinQuerySet(this, coll, joinType, temp);
        }
        return res;
    }
}
export default JoinQuerySet;
