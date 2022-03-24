import Field from '../sql/Field';
import * as bean from '../bean';

class BigIntType extends Field<bigint> {

	constructor(data?: bigint) {
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
				return BigIntType.prototype;
			}
		});
	}

	set(value: bigint | number | string) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (typeof value == 'bigint') {
			super.set(value);
		} else if (typeof value == 'number' || typeof value == 'string') {
			super.set(BigInt(value));
		} else {
			throw new bean.SqlException('Invalid BigInt Value: ' + value);
		}
	}

}

export default BigIntType;
