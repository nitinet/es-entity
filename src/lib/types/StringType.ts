import * as aggregation from 'aggregation/es6';

import * as sql from '../sql';

class StringType extends aggregation(String, sql.Field) {

	set(value: string | String) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (typeof value == 'string' || value instanceof String) {
			super.set(value.valueOf());
		}
	}

}

export default StringType;
