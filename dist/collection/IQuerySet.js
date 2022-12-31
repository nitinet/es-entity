import * as sql from '../sql/index.js';
class IQuerySet {
    context;
    stat = null;
    async unique() {
        let arr = await this.list();
        if (arr.length > 1)
            throw new Error('More than one row found in unique call');
        else
            return arr[0];
    }
    innerJoin(coll, param) {
        return this.join(coll, param, sql.types.Join.InnerJoin);
    }
    leftJoin(coll, param) {
        return this.join(coll, param, sql.types.Join.LeftJoin);
    }
    rightJoin(coll, param) {
        return this.join(coll, param, sql.types.Join.RightJoin);
    }
    outerJoin(coll, param) {
        return this.join(coll, param, sql.types.Join.OuterJoin);
    }
    getColumnExprs(fields, alias) {
        let exprs = fields.map(field => {
            let val = alias ? alias + '.' + field.colName : field.colName;
            return new sql.Expression(val);
        });
        return exprs;
    }
}
export default IQuerySet;
