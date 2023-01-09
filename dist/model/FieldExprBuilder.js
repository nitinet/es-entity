import BaseExprBuilder from './BaseExprBuilder.js';
class FieldExprBuilder extends BaseExprBuilder {
    constructor(fieldMap, alias) {
        super(fieldMap, alias);
    }
    expr(propName) {
        return this._expr(propName);
    }
}
export default FieldExprBuilder;
