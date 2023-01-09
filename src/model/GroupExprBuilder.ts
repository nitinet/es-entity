import BaseExprBuilder from './BaseExprBuilder.js';
import FieldMapping from './FieldMapping.js';
import { PropKeys } from './types.js';

class GroupExprBuilder<T extends Object> extends BaseExprBuilder<T> {

	constructor(fieldMap: Map<string | symbol, FieldMapping>, alias?: string) {
		super(fieldMap, alias);
	}

	expr(propName: PropKeys<T>) {
		return this._expr(propName);
	}

}

export default GroupExprBuilder;
