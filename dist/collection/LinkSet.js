import * as model from '../model/index.js';
import * as sql from '../sql/index.js';
import QuerySet from './QuerySet.js';
class LinkSet extends QuerySet {
    foreignFunc = null;
    constructor(context, entityType, foreignFunc) {
        super(context, context.tableSetMap.get(entityType), entityType);
        this.foreignFunc = foreignFunc;
    }
    apply(parentObj) {
        let expr = null;
        if (this.foreignFunc && this.foreignFunc instanceof Function) {
            let eb = new model.WhereExprBuilder(this.dbSet.fieldMap);
            expr = this.foreignFunc(eb, parentObj);
        }
        if (expr && expr instanceof sql.Expression && expr.exps.length > 0) {
            this.stat.where = this.stat.where.add(expr);
        }
    }
}
export default LinkSet;
