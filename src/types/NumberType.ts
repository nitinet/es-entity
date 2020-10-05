import Field from '../sql/Field';

class NumberType extends Field<number> {

	constructor(data?: number) {
		super();
		this.set(data);

		return new Proxy(this, {
			get(target, prop) {
				if (prop in target) {
					return target[prop];
				} else if (target._value) {
					return target._value[prop];
				}
			},
			getPrototypeOf() {
				return NumberType.prototype;
			}
		});

	}

	set(value: number | Number) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (typeof value == 'number' || value instanceof Number) {
			super.set(<number>value);
		}
	}

}

export default NumberType;
