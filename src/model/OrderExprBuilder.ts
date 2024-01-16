import Expression from '../sql/Expression.js';
import Operator from '../sql/types/Operator.js';
import BaseExprBuilder from './BaseExprBuilder.js';
import { KeyOf } from './types.js';

class OrderExprBuilder<T extends Object> extends BaseExprBuilder<T> {

	// Sorting Operators
	asc(propName: KeyOf<T>) {
		return new Expression(null, Operator.Asc, this._expr(propName));
	}

	desc(propName: KeyOf<T>) {
		return new Expression(null, Operator.Desc, this._expr(propName));
	}

}

export default OrderExprBuilder;
