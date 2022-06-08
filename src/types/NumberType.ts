import Field from '../sql/Field.js';
import * as bean from '../bean/index.js';

class NumberType extends Field<number> {

	constructor(data?: number) {
		super();
		this.set(data);
	}

	set(value: number) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (typeof value == 'number') {
			super.set(value);
		} else {
			throw new bean.SqlException('Invalid Number Value');
		}
	}

}

export default NumberType;
