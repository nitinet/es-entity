import * as sql from '../sql/Expression';

class DateType extends sql.Field<Date> implements Date {

	constructor(data?: Date) {
		super();
		this._value = data;
	}

	set(value: Date) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (value instanceof Date) {
			super.set(value);
		}
	}

	/**
	 * Converts a Date object to a string.
	 */
	[Symbol.toPrimitive](hint: 'default'): string;

	/**
	 * Converts a Date object to a string.
	 */
	[Symbol.toPrimitive](hint: 'string'): string;

	/**
	 * Converts a Date object to a number.
	 */
	[Symbol.toPrimitive](hint: 'number'): number;

	/**
	 * Converts a Date object to a string or number.
	 *
	 * @param hint The strings 'number', 'string', or 'default' to specify what primitive to return.
	 *
	 * @throws {TypeError} If 'hint' was given something other than 'number', 'string', or 'default'.
	 * @returns A number if 'hint' was 'number', a string if 'hint' was 'string' or 'default'.
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
		return this._value.toJSON(key);
	}

	getVarDate(): VarDate {
		return this._value.getVarDate();
	}

}

export default DateType;
