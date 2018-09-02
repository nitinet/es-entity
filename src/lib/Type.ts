import * as aggregation from 'aggregation/es6';

import * as Query from './Query';

export interface IEntityType<T> {
	new(): T;
}

class JsonField extends Query.Field<string> {
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

class StringField extends aggregation(String, Query.Field) {

	set(value: string | String) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (typeof value == 'string' || value instanceof String) {
			super.set(value.valueOf());
		}
	}

}

class NumberField extends aggregation(Number, Query.Field) {

	set(value: number | Number) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (typeof value == 'number' || value instanceof Number) {
			super.set(value.valueOf());
		}
	}

}

class BooleanField extends aggregation(Boolean, Query.Field) {

	set(value: boolean) {
		if (value == null || value == undefined) {
			super.set(null);
		} else {
			super.set(value.valueOf() ? true : false);
		}
	}

}

class DateField extends aggregation(Date, Query.Field) {

	constructor(data?: Date) {
		super();
	}

	set(value: Date) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (value instanceof Date) {
			super.set(value);
		}
	}

}

export { JsonField as Json };
export { StringField as String };
export { NumberField as Number };
export { BooleanField as Boolean };
export { DateField as Date };