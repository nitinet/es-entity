import * as aggregation from 'aggregation/es6';

import * as sql from '../sql/Expression';

class BooleanType extends aggregation(Boolean, sql.Field) {

	set(value: boolean | Boolean) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (typeof value == 'boolean' || value instanceof Boolean) {
			super.set(value);
		}
	}

}

export default BooleanType;
