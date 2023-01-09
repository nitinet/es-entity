import Expression from '../sql/Expression.js';
import Operator from '../sql/types/Operator.js';
import BaseExprBuilder from './BaseExprBuilder.js';
import FieldMapping from './FieldMapping.js';
import { PropKeys } from './types.js';

class OrderExprBuilder<T extends Object> extends BaseExprBuilder<T> {

	constructor(fieldMap: Map<string | symbol, FieldMapping>, alias?: string) {
		super(fieldMap, alias);
	}

	// Sorting Operators
	asc(propName: PropKeys<T>) {
		return new Expression(null, Operator.Asc, this._expr(propName));
	}
	desc(propName: PropKeys<T>) {
		return new Expression(null, Operator.Desc, this._expr(propName));
	}

}

export default OrderExprBuilder;
