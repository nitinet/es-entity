import Field from '../sql/Field';
import * as bean from '../bean';

class NumberType extends Field<number | BigInt> {

	constructor(data?: number | BigInt) {
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

	set(value: number | BigInt) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (typeof value == 'number' || typeof value == 'bigint') {
			super.set(value);
		} else {
			throw new bean.SqlException('Invalid Number Value');
		}
	}

}

export default NumberType;
