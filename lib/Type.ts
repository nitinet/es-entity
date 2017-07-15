import * as moment from 'moment';
import * as Query from "./Query";

export interface IEntityType<T> {
	new (): T;
}

class Field extends Query.Column {
	_value: any = null;
	_alias: string = "";
	_name: string = "";
	_updated: boolean = false;

	constructor() {
		super();
	}

	get(): any {
		return this._value;
	}

	set(value: any) {
		if (value !== this._value) {
			this._updated = true;
			this._value = value;
		}
	}

	toJSON() {
		if (this._value != null) {
			return this._value.valueOf();
		} else {
			return null;
		}
	}

	_createExpr(): Query.SqlExpression {
		let name = this._alias ? this._alias + "." + this._name : this._name;
		return new Query.SqlExpression(name);
	}

	_argExp(operand: any): Query.SqlExpression {
		let w: Query.SqlExpression = null;
		if (operand instanceof Query.Column) {
			w = (<Query.Column>operand)._createExpr();
		} else {
			w = new Query.SqlExpression("?");
			w.args = w.args.concat(operand);
		}
		return w;
	}

	// Column Interface functions
	// Comparison Operators
	eq(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Equal, this._createExpr(), this._argExp(operand));
	}
	neq(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.NotEqual, this._createExpr(), this._argExp(operand));
	}
	lt(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.LessThan, this._createExpr(), this._argExp(operand));
	}
	gt(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.GreaterThan, this._createExpr(), this._argExp(operand));
	}
	lteq(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.LessThanEqual, this._createExpr(), this._argExp(operand));
	}
	gteq(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.GreaterThanEqual, this._createExpr(), this._argExp(operand));
	}

	// Logical Operators
	and(operand: Query.Column): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.And, this._createExpr(), this._argExp(operand));
	}
	or(operand: Query.Column): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Or, this._createExpr(), this._argExp(operand));
	}
	not(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Not, this._createExpr());
	}

	// Inclusion Funtions
	in(...operand: any[]): Query.SqlExpression {
		let arg: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.Comma);
		for (let i = 0; i < operand.length; i++) {
			arg.exps.push(this._argExp(operand[i]));
		}
		return new Query.SqlExpression(null, Query.Operator.In, this._createExpr(), arg);
	}
	between(first: any, second: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Between, this._createExpr(), this._argExp(first), this._argExp(second));
	}
	like(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Like, this._createExpr(), this._argExp(operand));
	}
	IsNull(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.IsNull, this._createExpr());
	}
	IsNotNull(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.IsNotNull, this._createExpr());
	}

	// Arithmatic Operators
	plus(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Plus, this._createExpr(), this._argExp(operand));
	}
	minus(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Minus, this._createExpr(), this._argExp(operand));
	}
	multiply(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Multiply, this._createExpr(), this._argExp(operand));
	}
	devide(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Devide, this._createExpr(), this._argExp(operand));
	}

	// Sorting Operators
	asc(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Asc, this._createExpr());
	}
	desc(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Desc, this._createExpr());
	}

	// Group Functions
	sum(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Sum, this._createExpr());
	}
	min(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Min, this._createExpr());
	}
	max(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Max, this._createExpr());
	}
	count(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Count, this._createExpr());
	}
	average(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Avg, this._createExpr());
	}
}

class StringField extends Field implements String {
	_value: string = "";

	constructor(data?: string) {
		super();
		this._value = data;
	}

	get(): string {
		return super.get();
	}

	set(value: string) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (typeof value == 'string' || value instanceof String) {
			super.set(value.valueOf());
		}
	}

	/** Iterator */
	[Symbol.iterator](): IterableIterator<string> {
		return this._value[Symbol.iterator]();
	}

	/**
	* Returns a nonnegative integer Number less than 1114112 (0x110000) that is the code point
	* value of the UTF-16 encoded code point starting at the string element at position pos in
	* the String resulting from converting this object to a String.
	* If there is no element at that position, the result is undefined.
	* If a valid UTF-16 surrogate pair does not begin at pos, the result is the code unit at pos.
	*/
	codePointAt(pos: number): number {
		return this._value.codePointAt(pos);
	}

	/**
	* Returns true if searchString appears as a substring of the result of converting this
	* object to a String, at one or more positions that are
	* greater than or equal to position; otherwise, returns false.
	* @param searchString search string
	* @param position If position is undefined, 0 is assumed, so as to search all of the String.
	*/
	includes(searchString: string, position?: number): boolean {
		return this._value.includes(searchString, position);
	}

	/**
	* Returns true if the sequence of elements of searchString converted to a String is the
	* same as the corresponding elements of this object (converted to a String) starting at
	* endPosition – length(this). Otherwise returns false.
	*/
	endsWith(searchString: string, endPosition?: number): boolean {
		return this._value.endsWith(searchString, endPosition);
	}

	/**
	* Returns the String value result of normalizing the string into the normalization form
	* named by form as specified in Unicode Standard Annex #15, Unicode Normalization Forms.
	* @param form Applicable values: "NFC", "NFD", "NFKC", or "NFKD", If not specified default
	* is "NFC"
	*/
	normalize(form?: string): string {
		return this._value.normalize(form);
	}

	/**
	 * Returns a String value that is made from count copies appended together. If count is 0,
	 * T is the empty String is returned.
	 * @param count number of copies to append
	 */
	repeat(count: number): string {
		return this._value.repeat(count);
	}

	/**
	* Returns true if the sequence of elements of searchString converted to a String is the
	* same as the corresponding elements of this object (converted to a String) starting at
	* position. Otherwise returns false.
	*/
	startsWith(searchString: string, position?: number): boolean {
		return this._value.startsWith(searchString, position);
	}

	/**
	* Matches a string an object that supports being matched against, and returns an array containing the results of that search.
	* @param matcher An object that supports being matched against.
	*/
	match(matcher: any): RegExpMatchArray {
		return this._value.match(matcher);
	}

	/**
	* Replaces text in a string, using an object that supports replacement within a string.
	* @param searchValue A object can search for and replace matches within a string.
	* @param replaceValue A string containing the text to replace for every successful match of searchValue in this string.
	*/
	replace(searchValue: any, replaceValue: any): string {
		return this._value.replace(searchValue, replaceValue);
	}

	/**
	* Finds the first substring match in a regular expression search.
	* @param searcher An object which supports searching within a string.
	*/
	search(searcher: any): number {
		return this._value.search(searcher);
	}

	/**
	* Split a string into substrings using the specified separator and return them as an array.
	* @param splitter An object that can split a string.
	* @param limit A value used to limit the number of elements returned in the array.
	*/
	split(splitter: any, limit?: number): string[] {
		return this._value.split(splitter, limit);
	}

	/**
	* Returns an <a> HTML anchor element and sets the name attribute to the text value
	* @param name
	*/
	anchor(name: string): string {
		return this._value.anchor(name);
	}

	/** Returns a <big> HTML element */
	big(): string {
		return this._value.big();
	}

	/** Returns a <blink> HTML element */
	blink(): string {
		return this._value.blink();
	}

	/** Returns a <b> HTML element */
	bold(): string {
		return this._value.bold();
	}

	/** Returns a <tt> HTML element */
	fixed(): string {
		return this._value.fixed();
	}

	/** Returns a <font> HTML element and sets the color attribute value */
	fontcolor(color: string): string {
		return this._value.fontcolor(color);
	}

	/** Returns a <font> HTML element and sets the size attribute value */
	fontsize(size: any): string {
		return this._value.fontsize(size);
	}

	/** Returns an <i> HTML element */
	italics(): string {
		return this._value.italics();
	}

	/** Returns an <a> HTML element and sets the href attribute value */
	link(url: string): string {
		return this._value.link(url);
	}

	/** Returns a <small> HTML element */
	small(): string {
		return this._value.small();
	}

	/** Returns a <strike> HTML element */
	strike(): string {
		return this._value.strike();
	}

	/** Returns a <sub> HTML element */
	sub(): string {
		return this._value.sub();
	}

	/** Returns a <sup> HTML element */
	sup(): string {
		return this._value.sup();
	}


	/** Returns a string representation of a string. */
	toString(): string {
		return this._value.toString();
	}

	/**
		* Returns the character at the specified index.
		* @param pos The zero-based index of the desired character.
		*/
	charAt(pos: number): string {
		return this._value.charAt(pos);
	}

	/**
		* Returns the Unicode value of the character at the specified location.
		* @param index The zero-based index of the desired character. If there is no character at the specified index, NaN is returned.
		*/
	charCodeAt(index: number): number {
		return this._value.charCodeAt(index);
	}

	/**
		* Returns a string that contains the concatenation of two or more strings.
		* @param strings The strings to append to the end of the string.
		*/
	concat(...strings: string[]): string {
		return this._value.concat(...strings);
	}

	/**
		* Returns the position of the first occurrence of a substring.
		* @param searchString The substring to search for in the string
		* @param position The index at which to begin searching the String object. If omitted, search starts at the beginning of the string.
		*/
	indexOf(searchString: string, position?: number): number {
		return this._value.indexOf(searchString, position);
	}

	/**
		* Returns the last occurrence of a substring in the string.
		* @param searchString The substring to search for.
		* @param position The index at which to begin searching. If omitted, the search begins at the end of the string.
		*/
	lastIndexOf(searchString: string, position?: number): number {
		return this._value.lastIndexOf(searchString, position);
	}

	/**
		* Determines whether two strings are equivalent in the current locale.
		* @param that String to compare to target string
		*/
	localeCompare(that: string): number {
		return this._value.localeCompare(that);
	}

	/**
		* Returns a section of a string.
		* @param start The index to the beginning of the specified portion of stringObj.
		* @param end The index to the end of the specified portion of stringObj. The substring includes the characters up to, but not including, the character indicated by end.
		* If this value is not specified, the substring continues to the end of stringObj.
		*/
	slice(start?: number, end?: number): string {
		return this._value.slice(start, end);
	}

	/**
		* Returns the substring at the specified location within a String object.
		* @param start The zero-based index number indicating the beginning of the substring.
		* @param end Zero-based index number indicating the end of the substring. The substring includes the characters up to, but not including, the character indicated by end.
		* If end is omitted, the characters from start through the end of the original string are returned.
		*/
	substring(start: number, end?: number): string {
		return this._value.substring(start, end);
	}

	/** Converts all the alphabetic characters in a string to lowercase. */
	toLowerCase(): string {
		return this._value.toLowerCase();
	}

	/** Converts all alphabetic characters to lowercase, taking into account the host environment's current locale. */
	toLocaleLowerCase(): string {
		return this._value.toLocaleLowerCase();
	}

	/** Converts all the alphabetic characters in a string to uppercase. */
	toUpperCase(): string {
		return this._value.toUpperCase();
	}

	/** Returns a string where all alphabetic characters have been converted to uppercase, taking into account the host environment's current locale. */
	toLocaleUpperCase(): string {
		return this._value.toLocaleUpperCase();
	}

	/** Removes the leading and trailing white space and line terminator characters from a string. */
	trim(): string {
		return this._value.trim();
	}

	/** Returns the length of a String object. */
	length: number;

	// IE extensions
	/**
		* Gets a substring beginning at the specified location and having the specified length.
		* @param from The starting position of the desired substring. The index of the first character in the string is zero.
		* @param length The number of characters to include in the returned substring.
		*/
	substr(from: number, length?: number): string {
		return this._value.substr(from, length);
	}

	/** Returns the primitive value of the specified object. */
	valueOf(): string {
		return this._value.valueOf();
	}

	[index: number]: string;

	padStart(maxLength: number, fillString?: string): string {
		return null;
	}

	padEnd(maxLength: number, fillString?: string): string {
		return null;
	}

}

class NumberField extends Field implements Number {

	constructor(data?: number) {
		super();
		this._value = data;
	}

	get(): number {
		return super.get();
	}

	set(value: number | Number) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (typeof value == 'number' || value instanceof Number) {
			super.set(value.valueOf());
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

class BooleanField extends Field implements Boolean {
	_value: boolean = false;

	constructor(data?: boolean) {
		super();
		this._value = data;
	}

	get(): boolean {
		return super.get();
	}

	set(value: boolean) {
		if (value == null || value == undefined) {
			super.set(null);
		} else {
			super.set(value.valueOf() ? true : false);
		}
	}

	/** Returns the primitive value of the specified object. */
	valueOf(): boolean {
		return this._value.valueOf();
	}
}

class DateField extends Field implements Date {
	_value: Date = new Date();

	constructor(data?: Date) {
		super();
		this._value = data;
	}

	get(): Date {
		return super.get();
	}

	set(value: Date) {
		if (value == null || value == undefined) {
			super.set(null);
		} else {
			super.set(new Date(value.valueOf()));
		}
	}

	/**
	 * Converts a Date object to a string.
	 */
	[Symbol.toPrimitive](hint: "default"): string;

	/**
	 * Converts a Date object to a string.
	 */
	[Symbol.toPrimitive](hint: "string"): string;

	/**
	 * Converts a Date object to a number.
	 */
	[Symbol.toPrimitive](hint: "number"): number;

	/**
	 * Converts a Date object to a string or number.
	 *
	 * @param hint The strings "number", "string", or "default" to specify what primitive to return.
	 *
	 * @throws {TypeError} If 'hint' was given something other than "number", "string", or "default".
	 * @returns A number if 'hint' was "number", a string if 'hint' was "string" or "default".
	 */
	[Symbol.toPrimitive](hint: string): string | number {
		return this._value[Symbol.toPrimitive](hint);
	}

	/** Returns a string representation of a date. The format of the string depends on the locale. */
	toString(): string {
		return this._value.toString();
	}
	/** Returns a date as a string value. */
	toDateString(): string {
		return this._value.toDateString();
	}
	/** Returns a time as a string value. */
	toTimeString(): string {
		return this._value.toTimeString();
	}
	/** Returns a value as a string value appropriate to the host environment's current locale. */
	toLocaleString(): string {
		return this._value.toLocaleString();
	}
	/** Returns a date as a string value appropriate to the host environment's current locale. */
	toLocaleDateString(): string {
		return this._value.toLocaleDateString();
	}
	/** Returns a time as a string value appropriate to the host environment's current locale. */
	toLocaleTimeString(): string {
		return this._value.toLocaleTimeString();
	}
	/** Returns the stored time value in milliseconds since midnight, January 1, 1970 UTC. */
	valueOf(): number {
		return this._value.valueOf();
	}
	/** Gets the time value in milliseconds. */
	getTime(): number {
		return this._value.getTime();
	}
	/** Gets the year, using local time. */
	getFullYear(): number {
		return this._value.getFullYear();
	}
	/** Gets the year using Universal Coordinated Time (UTC). */
	getUTCFullYear(): number {
		return this._value.getUTCFullYear();
	}
	/** Gets the month, using local time. */
	getMonth(): number {
		return this._value.getMonth();
	}
	/** Gets the month of a Date object using Universal Coordinated Time (UTC). */
	getUTCMonth(): number {
		return this._value.getUTCMonth();
	}
	/** Gets the day-of-the-month, using local time. */
	getDate(): number {
		return this._value.getDate();
	}
	/** Gets the day-of-the-month, using Universal Coordinated Time (UTC). */
	getUTCDate(): number {
		return this._value.getUTCDate();
	}
	/** Gets the day of the week, using local time. */
	getDay(): number {
		return this._value.getDay();
	}
	/** Gets the day of the week using Universal Coordinated Time (UTC). */
	getUTCDay(): number {
		return this._value.getUTCDay();
	}
	/** Gets the hours in a date, using local time. */
	getHours(): number {
		return this._value.getHours();
	}
	/** Gets the hours value in a Date object using Universal Coordinated Time (UTC). */
	getUTCHours(): number {
		return this._value.getUTCHours();
	}
	/** Gets the minutes of a Date object, using local time. */
	getMinutes(): number {
		return this._value.getMinutes();
	}
	/** Gets the minutes of a Date object using Universal Coordinated Time (UTC). */
	getUTCMinutes(): number {
		return this._value.getUTCMinutes();
	}
	/** Gets the seconds of a Date object, using local time. */
	getSeconds(): number {
		return this._value.getSeconds();
	}
	/** Gets the seconds of a Date object using Universal Coordinated Time (UTC). */
	getUTCSeconds(): number {
		return this._value.getUTCSeconds();
	}
	/** Gets the milliseconds of a Date, using local time. */
	getMilliseconds(): number {
		return this._value.getMilliseconds();
	}
	/** Gets the milliseconds of a Date object using Universal Coordinated Time (UTC). */
	getUTCMilliseconds(): number {
		return this._value.getUTCMilliseconds();
	}
	/** Gets the difference in minutes between the time on the local computer and Universal Coordinated Time (UTC). */
	getTimezoneOffset(): number {
		return this._value.getTimezoneOffset();
	}
	/**
		* Sets the date and time value in the Date object.
		* @param time A numeric value representing the number of elapsed milliseconds since midnight, January 1, 1970 GMT.
		*/
	setTime(time: number): number {
		return this._value.setTime(time);
	}
	/**
		* Sets the milliseconds value in the Date object using local time.
		* @param ms A numeric value equal to the millisecond value.
		*/
	setMilliseconds(ms: number): number {
		return this._value.setMilliseconds(ms);
	}
	/**
		* Sets the milliseconds value in the Date object using Universal Coordinated Time (UTC).
		* @param ms A numeric value equal to the millisecond value.
		*/
	setUTCMilliseconds(ms: number): number {
		return this._value.setUTCMilliseconds(ms);
	}

	/**
		* Sets the seconds value in the Date object using local time.
		* @param sec A numeric value equal to the seconds value.
		* @param ms A numeric value equal to the milliseconds value.
		*/
	setSeconds(sec: number, ms?: number): number {
		return this._value.setSeconds(sec, ms);
	}
	/**
		* Sets the seconds value in the Date object using Universal Coordinated Time (UTC).
		* @param sec A numeric value equal to the seconds value.
		* @param ms A numeric value equal to the milliseconds value.
		*/
	setUTCSeconds(sec: number, ms?: number): number {
		return this._value.setUTCSeconds(sec, ms);
	}
	/**
		* Sets the minutes value in the Date object using local time.
		* @param min A numeric value equal to the minutes value.
		* @param sec A numeric value equal to the seconds value.
		* @param ms A numeric value equal to the milliseconds value.
		*/
	setMinutes(min: number, sec?: number, ms?: number): number {
		return this._value.setMinutes(min, sec, ms);
	}
	/**
		* Sets the minutes value in the Date object using Universal Coordinated Time (UTC).
		* @param min A numeric value equal to the minutes value.
		* @param sec A numeric value equal to the seconds value.
		* @param ms A numeric value equal to the milliseconds value.
		*/
	setUTCMinutes(min: number, sec?: number, ms?: number): number {
		return this._value.setUTCMinutes(min, sec, ms);
	}
	/**
		* Sets the hour value in the Date object using local time.
		* @param hours A numeric value equal to the hours value.
		* @param min A numeric value equal to the minutes value.
		* @param sec A numeric value equal to the seconds value.
		* @param ms A numeric value equal to the milliseconds value.
		*/
	setHours(hours: number, min?: number, sec?: number, ms?: number): number {
		return this._value.setHours(hours, min, sec, ms);
	}
	/**
		* Sets the hours value in the Date object using Universal Coordinated Time (UTC).
		* @param hours A numeric value equal to the hours value.
		* @param min A numeric value equal to the minutes value.
		* @param sec A numeric value equal to the seconds value.
		* @param ms A numeric value equal to the milliseconds value.
		*/
	setUTCHours(hours: number, min?: number, sec?: number, ms?: number): number {
		return this._value.setUTCHours(hours, min, sec, ms);
	}
	/**
		* Sets the numeric day-of-the-month value of the Date object using local time.
		* @param date A numeric value equal to the day of the month.
		*/
	setDate(date: number): number {
		return this._value.setDate(date);
	}
	/**
		* Sets the numeric day of the month in the Date object using Universal Coordinated Time (UTC).
		* @param date A numeric value equal to the day of the month.
		*/
	setUTCDate(date: number): number {
		return this._value.setUTCDate(date);
	}
	/**
		* Sets the month value in the Date object using local time.
		* @param month A numeric value equal to the month. The value for January is 0, and other month values follow consecutively.
		* @param date A numeric value representing the day of the month. If this value is not supplied, the value from a call to the getDate method is used.
		*/
	setMonth(month: number, date?: number): number {
		return this._value.setMonth(month, date);
	}
	/**
		* Sets the month value in the Date object using Universal Coordinated Time (UTC).
		* @param month A numeric value equal to the month. The value for January is 0, and other month values follow consecutively.
		* @param date A numeric value representing the day of the month. If it is not supplied, the value from a call to the getUTCDate method is used.
		*/
	setUTCMonth(month: number, date?: number): number {
		return this._value.setUTCMonth(month, date);
	}
	/**
		* Sets the year of the Date object using local time.
		* @param year A numeric value for the year.
		* @param month A zero-based numeric value for the month (0 for January, 11 for December). Must be specified if numDate is specified.
		* @param date A numeric value equal for the day of the month.
		*/
	setFullYear(year: number, month?: number, date?: number): number {
		return this._value.setFullYear(year, month, date);
	}
	/**
		* Sets the year value in the Date object using Universal Coordinated Time (UTC).
		* @param year A numeric value equal to the year.
		* @param month A numeric value equal to the month. The value for January is 0, and other month values follow consecutively. Must be supplied if numDate is supplied.
		* @param date A numeric value equal to the day of the month.
		*/
	setUTCFullYear(year: number, month?: number, date?: number): number {
		return this._value.setUTCFullYear(year, month, date);
	}
	/** Returns a date converted to a string using Universal Coordinated Time (UTC). */
	toUTCString(): string {
		return this._value.toUTCString();
	}
	/** Returns a date as a string value in ISO format. */
	toISOString(): string {
		return this._value.toISOString();
	}
	/** Used by the JSON.stringify method to enable the transformation of an object's data for JavaScript Object Notation (JSON) serialization. */
	toJSON(key?: any): string {
		if (this._value != null) {
			return moment(this._value).format('DD/MM/YYYY HH:mm:ss.SSS')
		} else {
			return null;
		}
	}

	getVarDate(): VarDate {
		return this._value.getVarDate();
	}

}

export { Field };
export { StringField as String };
export { NumberField as Number };
export { BooleanField as Boolean };
export { DateField as Date };