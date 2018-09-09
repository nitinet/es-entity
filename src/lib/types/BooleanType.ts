import * as aggregation from 'aggregation/es6';

import * as sql from '../sql/Expression';

class BooleanType extends sql.Field<boolean> implements Boolean {

	constructor(data?: boolean) {
		super();
		if (data) {
			this._value = data.valueOf() ? true : false;
		}
	}

	set(value: boolean) {
		if (value == null || value == undefined) {
			super.set(null);
		} else {
			super.set(value.valueOf() ? true : false);
		}
	}

	/** Returns the primitive value of the specified object. */
	valueOf(): boolean {
		return this._value;
	}
}

export default BooleanType;
