import IQuerySet from './IQuerySet.js';
import * as sql from '../sql/index.js';
class JoinQuerySet extends IQuerySet {
    mainSet;
    joinSet;
    stat = new sql.Statement();
    constructor(mainSet, joinSet, joinType, expr) {
        super();
        this.mainSet = mainSet;
        this.context = mainSet.context;
        this.joinSet = joinSet;
        this.stat = new sql.Statement();
        this.stat.collection.join = joinType;
        this.stat.where = this.stat.where.add(expr);
    }
    getEntity() {
        let mainObj = this.mainSet.getEntity();
        let joinObj = this.joinSet.getEntity();
        return Object.assign(mainObj, joinObj);
    }
    async list() {
        return new Array();
    }
    async mapData(input) {
        return new Array();
    }
    select(TargetType) {
        return null;
    }
    selectPlain(keys) {
        return null;
    }
    where(param, ...args) {
        return this;
    }
    groupBy(param) {
        return this;
    }
    orderBy(param) {
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
            let mainObj = this.getEntity();
            let joinObj = coll.getEntity();
            temp = param(mainObj, joinObj);
        }
        let res;
        if (temp instanceof sql.Expression && temp.exps.length > 0) {
            res = new JoinQuerySet(this, coll, joinType, temp);
        }
        else {
            throw new TypeError('Invalid Join');
        }
        return res;
    }
}
export default JoinQuerySet;
//# sourceMappingURL=JoinQuerySet.js.map