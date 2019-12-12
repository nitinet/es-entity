import * as sql from '../sql/Expression';

class BooleanType extends sql.Field<boolean> {

	constructor(data?: boolean) {
		super();
		this.set(data);

		return new Proxy(this, {
			get(target, prop) {
				if (prop in target) {
					return target[prop];
				} else if (prop in <Boolean>target._value) {
					return target._value[prop];
				}
			}
		});

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

}

export default BooleanType;
