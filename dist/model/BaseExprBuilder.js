import Expression from '../sql/Expression.js';
class BaseExprBuilder {
    fieldMap;
    alias;
    constructor(fieldMap, alias) {
        this.fieldMap = fieldMap;
        this.alias = alias;
    }
    _expr(propName) {
        let field = this.fieldMap.get(propName);
        if (!field)
            throw new TypeError('Field Not Found');
        let name = this.alias ? this.alias + '.' + field.colName : field.colName;
        return new Expression(name);
    }
}
export default BaseExprBuilder;
//# sourceMappingURL=BaseExprBuilder.js.map