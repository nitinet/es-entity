import * as aggregation from 'aggregation/es6';

import * as sql from '../sql/Expression';

class NumberType extends sql.Field<number> implements Number {

	constructor(data?: number) {
		super();
		this._value = data;
	}

	set(value: number | Number) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (typeof value == 'number' || value instanceof Number) {
			super.set(value);
		}
	}

	/**
	* Returns a string representation of an object.
	* @param radix Specifies a radix for converting numeric values to strings. This value is only used for numbers.
	*/
	toString(radix?: number): string {
		return this._value.toString(radix);
	}

	/**
	* Returns a string representing a number in fixed-point notation.
	* @param fractionDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
	*/
	toFixed(fractionDigits?: number): string {
		return this._value.toFixed(fractionDigits);
	}

	/**
	* Returns a string containing a number represented in exponential notation.
	* @param fractionDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
	*/
	toExponential(fractionDigits?: number): string {
		return this._value.toExponential(fractionDigits);
	}

	/**
	* Returns a string containing a number represented either in exponential or fixed-point notation with a specified number of digits.
	* @param precision Number of significant digits. Must be in the range 1 - 21, inclusive.
	*/
	toPrecision(precision?: number): string {
		return this._value.toPrecision(precision);
	}

	/** Returns the primitive value of the specified object. */
	valueOf(): number {
		return this._value.valueOf();
	}

}

export default NumberType;
