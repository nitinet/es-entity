import Expression from '../sql/Expression.js';
import Operator from '../sql/types/Operator.js';
class OrderEntity {
    fieldMap = null;
    alias = null;
    constructor(fieldMap, alias) {
        this.fieldMap = fieldMap;
        this.alias = alias;
    }
    expr(propName) {
        let field = this.fieldMap.get(propName);
        let name = this.alias ? this.alias + '.' + field.colName : field.colName;
        return new Expression(name);
    }
    asc(propName) {
        return new Expression(null, Operator.Asc, this.expr(propName));
    }
    desc(propName) {
        return new Expression(null, Operator.Desc, this.expr(propName));
    }
}
export default OrderEntity;
