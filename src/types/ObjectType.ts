import Field from '../sql/Field';

class ObjectType extends Field<object> {

	constructor(data?: Object) {
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
				return ObjectType.prototype;
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
