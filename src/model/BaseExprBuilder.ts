import Expression from '../sql/Expression.js';
import FieldMapping from './FieldMapping.js';
import { PropKeys } from './types.js';

class BaseExprBuilder<T extends Object> {
	private fieldMap: Map<string | number | symbol, FieldMapping>;
	private alias: string | undefined;

	constructor(fieldMap: Map<string | symbol, FieldMapping>, alias?: string) {
		this.fieldMap = fieldMap;
		this.alias = alias;
	}

	protected _expr(propName: PropKeys<T>) {
		let field = this.fieldMap.get(propName);
		if (!field) throw new TypeError('Field Not Found');
		let name = this.alias ? this.alias + '.' + field.colName : field.colName;
		return new Expression(name);
	}

}

export default BaseExprBuilder;
