import * as sql from '../sql/Expression';

class BooleanType extends sql.Field<boolean> implements Boolean {

	constructor(data?: boolean) {
		super();
		this.set(data);
	}

	set(value: boolean | Boolean) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (typeof value == 'boolean' || value instanceof Boolean) {
			super.set(<boolean>value);
		} else {
			super.set(value ? true : false);
		}
	}

	/** Returns the primitive value of the specified object. */
	valueOf(): boolean {
		return this._value;
	}
}

export default BooleanType;
