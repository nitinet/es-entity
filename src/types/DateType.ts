import Field from '../sql/Field';
import * as bean from '../bean';

class DateType extends Field<Date> {

	constructor(data?: Date) {
		super();
		this.set(data);
	}

	set(value: Date) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (value instanceof Date) {
			super.set(value);
		} else {
			throw new bean.SqlException('Invalid Date Value');
		}
	}

}

export default DateType;
