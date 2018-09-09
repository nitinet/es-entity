import * as aggregation from 'aggregation/es6';

import * as sql from '../sql/Expression';

class StringType extends sql.Field<string> implements String {

	constructor(data?: string) {
		super();
		this._value = data;
	}

	set(value: string | String) {
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
	* @param form Applicable values: 'NFC', 'NFD', 'NFKC', or 'NFKD', If not specified default
	* is 'NFC'
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

export default StringType;
