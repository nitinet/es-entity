import * as sql from '../sql/Expression';

class StringType extends sql.Field<string> {

	constructor(data?: string) {
		super();
		this._value = data;

		return new Proxy(this, {
			get(target, prop) {
				if (prop in target) {
					return target[prop];
				} else if (prop in <String>target._value) {
					return target._value[prop];
				}
			},
			getPrototypeOf() {
				return String.prototype;
			}
		});
	}

	set(value: string | String) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (typeof value == 'string' || value instanceof String) {
			super.set(<string>value);
		}
	}

}

export default StringType;
