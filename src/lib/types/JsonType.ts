import * as sql from '../sql/Expression';

class JsonType extends sql.Field<object> {

	constructor(data?: string) {
		super();
		this.set(data);
	}

	get() {
		return this._value;
	}

	set(value) {
		if (value != undefined) {
			let v = JSON.parse(value);
			if (v !== this._value) {
				this._updated = true;
				this._value = v;
			}
		}
	}

	toJSON() {
		return this._value;
	}

}

export default JsonType;
