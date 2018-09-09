import * as sql from '../sql/Expression';

class JsonType extends sql.Field<string> {
	private _value: string = null;

	constructor(data?: string) {
		super();
		this.set(data);
	}

	get() {
		return this._value ? JSON.parse(this._value) : null;
	}

	set(value) {
		let v = JSON.stringify(value);
		if (v !== this._value) {
			this._updated = true;
			this._value = v;
		}
	}

	toJSON() {
		return JSON.parse(this._value);
	}
}

export default JsonType;
