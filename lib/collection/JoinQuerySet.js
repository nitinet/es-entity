import * as sql from '../sql/index.js';
import IQuerySet from './IQuerySet.js';
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
    async list() {
        return new Array();
    }
    stream() {
        throw new Error('Method not implemented.');
    }
    listPlain(keys) {
        throw new Error('Method not implemented.');
    }
    async mapData(input) {
        return new Array();
    }
    select(EntityType) {
        throw new Error('Method not implemented.');
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
}
export default JoinQuerySet;
//# sourceMappingURL=JoinQuerySet.js.map