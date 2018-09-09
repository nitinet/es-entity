import * as aggregation from 'aggregation/es6';

import * as sql from '../sql/Expression';

class DateType extends aggregation(Date, sql.Field) {

	set(value: Date) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (value instanceof Date) {
			super.set(value);
		}
	}

}

export default DateType;
