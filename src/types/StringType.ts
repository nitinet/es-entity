import Field from '../sql/Field';

class StringType extends Field<string> {

	constructor(data?: string) {
		super();
		this._value = data;

		return new Proxy(this, {
			get(target, prop) {
				if (prop in target) {
					return target[prop];
				} else if (target._value) {
					return target._value[prop];
				}
			},
			getPrototypeOf() {
				return Field.prototype;
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
