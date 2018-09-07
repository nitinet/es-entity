import * as aggregation from 'aggregation/es6';

import * as sql from '../sql';

class BooleanType extends aggregation(Boolean, sql.Field) {

	set(value: boolean) {
		if (value == null || value == undefined) {
			super.set(null);
		} else {
			super.set(value.valueOf() ? true : false);
		}
	}

}

export default BooleanType;
