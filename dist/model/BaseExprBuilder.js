import Expression from '../sql/Expression.js';
class BaseExprBuilder {
    fieldMap = null;
    alias = null;
    constructor(fieldMap, alias) {
        this.fieldMap = fieldMap;
        this.alias = alias;
    }
    _expr(propName) {
        let field = this.fieldMap.get(propName);
        let name = this.alias ? this.alias + '.' + field.colName : field.colName;
        return new Expression(name);
    }
}
export default BaseExprBuilder;
