import * as sql from '../sql/index.js';
class IQuerySet {
    context;
    async single() {
        let arr = await this.list();
        if (arr.length > 1)
            throw new Error('More than one row found in unique call');
        else if (arr.length == 0)
            return null;
        else
            return arr[0];
    }
    async singleOrThrow() {
        let val = await this.single();
        if (!val)
            throw new Error('Value Not Found');
        return val;
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
//# sourceMappingURL=IQuerySet.js.map