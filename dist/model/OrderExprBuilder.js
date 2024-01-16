import Expression from '../sql/Expression.js';
import Operator from '../sql/types/Operator.js';
import BaseExprBuilder from './BaseExprBuilder.js';
class OrderExprBuilder extends BaseExprBuilder {
    asc(propName) {
        return new Expression(null, Operator.Asc, this._expr(propName));
    }
    desc(propName) {
        return new Expression(null, Operator.Desc, this._expr(propName));
    }
}
export default OrderExprBuilder;
//# sourceMappingURL=OrderExprBuilder.js.map