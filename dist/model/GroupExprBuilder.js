import BaseExprBuilder from './BaseExprBuilder.js';
class GroupExprBuilder extends BaseExprBuilder {
    constructor(fieldMap, alias) {
        super(fieldMap, alias);
    }
    expr(propName) {
        return this._expr(propName);
    }
}
export default GroupExprBuilder;
//# sourceMappingURL=GroupExprBuilder.js.map