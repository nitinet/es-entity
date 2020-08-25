import Field from '../sql/Field';

class DateType extends Field<Date> {

	constructor(data?: Date) {
		super();
		if (data instanceof Date) {
			this._value = data;
		} else {
			this._value = new Date(data);
		}

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

	set(value: Date) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (value instanceof Date) {
			super.set(value);
		}
	}

}

export default DateType;
