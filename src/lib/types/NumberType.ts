import * as aggregation from 'aggregation/es6';

import * as sql from '../sql';

class NumberType extends aggregation(Number, sql.Field) {

	set(value: number | Number) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (typeof value == 'number' || value instanceof Number) {
			super.set(value.valueOf());
		}
	}

}

export default NumberType;
