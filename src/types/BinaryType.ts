import Field from '../sql/Field';
import * as bean from '../bean';

class BinaryType extends Field<Buffer> {

	constructor(data?: Buffer) {
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
				return BinaryType.prototype;
			}
		});

	}

	set(value: Buffer) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (value instanceof Buffer) {
			super.set(value);
		} else {
			throw new bean.SqlException('Invalid Buffer Value');
		}
	}

}

export default BinaryType;
