import * as sql from '../sql/Expression';

class ObjectType extends sql.Field<object> {

	constructor(data?: Object) {
		super();
		this._value = data;

		return new Proxy(this, {
			get(target, prop) {
				if (prop in target) {
					return target[prop];
				} else if (prop in <Object>target._value) {
					return target._value[prop];
				}
			},
			getPrototypeOf() {
				return String.prototype;
			}
		});

	}

	set(value: object | Object) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (typeof value == 'object') {
			super.set(value);
		}
	}

}

export default ObjectType;
