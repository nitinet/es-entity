import Field from '../sql/Field';
import * as bean from '../bean';

class StringType extends Field<string> {

	constructor(data?: string) {
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
				return StringType.prototype;
			}
		});
	}

	set(value: string) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (typeof value == 'string') {
			super.set(value);
		} else {
			throw new bean.SqlException('Invalid String Value');
		}
	}

}

export default StringType;
