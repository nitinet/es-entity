"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var moment = require("moment");
var Query = require("./Query");
var Field = (function (_super) {
    __extends(Field, _super);
    function Field() {
        var _this = _super.call(this) || this;
        _this._value = null;
        _this._alias = "";
        _this._name = "";
        _this._updated = false;
        return _this;
    }
    Field.prototype.get = function () {
        return this._value;
    };
    Field.prototype.set = function (value) {
        if (value !== this._value) {
            this._updated = true;
            this._value = value;
        }
    };
    Field.prototype.toJSON = function () {
        if (this._value != null) {
            return this._value.valueOf();
        }
        else {
            return null;
        }
    };
    Field.prototype._createExpr = function () {
        var name = this._alias ? this._alias + "." + this._name : this._name;
        return new Query.SqlExpression(name);
    };
    Field.prototype._argExp = function (operand) {
        var w = null;
        if (operand instanceof Query.Column) {
            w = operand._createExpr();
        }
        else {
            w = new Query.SqlExpression("?");
            w.args = w.args.concat(operand);
        }
        return w;
    };
    // Column Interface functions
    // Comparison Operators
    Field.prototype.eq = function (operand) {
        return new Query.SqlExpression(null, Query.Operator.Equal, this._createExpr(), this._argExp(operand));
    };
    Field.prototype.neq = function (operand) {
        return new Query.SqlExpression(null, Query.Operator.NotEqual, this._createExpr(), this._argExp(operand));
    };
    Field.prototype.lt = function (operand) {
        return new Query.SqlExpression(null, Query.Operator.LessThan, this._createExpr(), this._argExp(operand));
    };
    Field.prototype.gt = function (operand) {
        return new Query.SqlExpression(null, Query.Operator.GreaterThan, this._createExpr(), this._argExp(operand));
    };
    Field.prototype.lteq = function (operand) {
        return new Query.SqlExpression(null, Query.Operator.LessThanEqual, this._createExpr(), this._argExp(operand));
    };
    Field.prototype.gteq = function (operand) {
        return new Query.SqlExpression(null, Query.Operator.GreaterThanEqual, this._createExpr(), this._argExp(operand));
    };
    // Logical Operators
    Field.prototype.and = function (operand) {
        return new Query.SqlExpression(null, Query.Operator.And, this._createExpr(), this._argExp(operand));
    };
    Field.prototype.or = function (operand) {
        return new Query.SqlExpression(null, Query.Operator.Or, this._createExpr(), this._argExp(operand));
    };
    Field.prototype.not = function () {
        return new Query.SqlExpression(null, Query.Operator.Not, this._createExpr());
    };
    // Inclusion Funtions
    Field.prototype["in"] = function () {
        var operand = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operand[_i] = arguments[_i];
        }
        var arg = new Query.SqlExpression(null, Query.Operator.Comma);
        for (var i = 0; i < operand.length; i++) {
            arg.exps.push(this._argExp(operand[i]));
        }
        return new Query.SqlExpression(null, Query.Operator.In, this._createExpr(), arg);
    };
    Field.prototype.between = function (first, second) {
        return new Query.SqlExpression(null, Query.Operator.Between, this._createExpr(), this._argExp(first), this._argExp(second));
    };
    Field.prototype.like = function (operand) {
        return new Query.SqlExpression(null, Query.Operator.Like, this._createExpr(), this._argExp(operand));
    };
    Field.prototype.IsNull = function () {
        return new Query.SqlExpression(null, Query.Operator.IsNull, this._createExpr());
    };
    Field.prototype.IsNotNull = function () {
        return new Query.SqlExpression(null, Query.Operator.IsNotNull, this._createExpr());
    };
    // Arithmatic Operators
    Field.prototype.plus = function (operand) {
        return new Query.SqlExpression(null, Query.Operator.Plus, this._createExpr(), this._argExp(operand));
    };
    Field.prototype.minus = function (operand) {
        return new Query.SqlExpression(null, Query.Operator.Minus, this._createExpr(), this._argExp(operand));
    };
    Field.prototype.multiply = function (operand) {
        return new Query.SqlExpression(null, Query.Operator.Multiply, this._createExpr(), this._argExp(operand));
    };
    Field.prototype.devide = function (operand) {
        return new Query.SqlExpression(null, Query.Operator.Devide, this._createExpr(), this._argExp(operand));
    };
    // Sorting Operators
    Field.prototype.asc = function () {
        return new Query.SqlExpression(null, Query.Operator.Asc, this._createExpr());
    };
    Field.prototype.desc = function () {
        return new Query.SqlExpression(null, Query.Operator.Desc, this._createExpr());
    };
    // Group Functions
    Field.prototype.sum = function () {
        return new Query.SqlExpression(null, Query.Operator.Sum, this._createExpr());
    };
    Field.prototype.min = function () {
        return new Query.SqlExpression(null, Query.Operator.Min, this._createExpr());
    };
    Field.prototype.max = function () {
        return new Query.SqlExpression(null, Query.Operator.Max, this._createExpr());
    };
    Field.prototype.count = function () {
        return new Query.SqlExpression(null, Query.Operator.Count, this._createExpr());
    };
    Field.prototype.average = function () {
        return new Query.SqlExpression(null, Query.Operator.Avg, this._createExpr());
    };
    return Field;
}(Query.Column));
exports.Field = Field;
var StringField = (function (_super) {
    __extends(StringField, _super);
    function StringField(data) {
        var _this = _super.call(this) || this;
        _this._value = "";
        _this._value = data;
        return _this;
    }
    StringField.prototype.get = function () {
        return _super.prototype.get.call(this);
    };
    StringField.prototype.set = function (value) {
        if (value == null || value == undefined) {
            _super.prototype.set.call(this, null);
        }
        else if (typeof value == 'string' || value instanceof String) {
            _super.prototype.set.call(this, value.valueOf());
        }
    };
    /** Iterator */
    StringField.prototype[Symbol.iterator] = function () {
        return this._value[Symbol.iterator]();
    };
    /**
    * Returns a nonnegative integer Number less than 1114112 (0x110000) that is the code point
    * value of the UTF-16 encoded code point starting at the string element at position pos in
    * the String resulting from converting this object to a String.
    * If there is no element at that position, the result is undefined.
    * If a valid UTF-16 surrogate pair does not begin at pos, the result is the code unit at pos.
    */
    StringField.prototype.codePointAt = function (pos) {
        return this._value.codePointAt(pos);
    };
    /**
    * Returns true if searchString appears as a substring of the result of converting this
    * object to a String, at one or more positions that are
    * greater than or equal to position; otherwise, returns false.
    * @param searchString search string
    * @param position If position is undefined, 0 is assumed, so as to search all of the String.
    */
    StringField.prototype.includes = function (searchString, position) {
        return this._value.includes(searchString, position);
    };
    /**
    * Returns true if the sequence of elements of searchString converted to a String is the
    * same as the corresponding elements of this object (converted to a String) starting at
    * endPosition – length(this). Otherwise returns false.
    */
    StringField.prototype.endsWith = function (searchString, endPosition) {
        return this._value.endsWith(searchString, endPosition);
    };
    /**
    * Returns the String value result of normalizing the string into the normalization form
    * named by form as specified in Unicode Standard Annex #15, Unicode Normalization Forms.
    * @param form Applicable values: "NFC", "NFD", "NFKC", or "NFKD", If not specified default
    * is "NFC"
    */
    StringField.prototype.normalize = function (form) {
        return this._value.normalize(form);
    };
    /**
     * Returns a String value that is made from count copies appended together. If count is 0,
     * T is the empty String is returned.
     * @param count number of copies to append
     */
    StringField.prototype.repeat = function (count) {
        return this._value.repeat(count);
    };
    /**
    * Returns true if the sequence of elements of searchString converted to a String is the
    * same as the corresponding elements of this object (converted to a String) starting at
    * position. Otherwise returns false.
    */
    StringField.prototype.startsWith = function (searchString, position) {
        return this._value.startsWith(searchString, position);
    };
    /**
    * Matches a string an object that supports being matched against, and returns an array containing the results of that search.
    * @param matcher An object that supports being matched against.
    */
    StringField.prototype.match = function (matcher) {
        return this._value.match(matcher);
    };
    /**
    * Replaces text in a string, using an object that supports replacement within a string.
    * @param searchValue A object can search for and replace matches within a string.
    * @param replaceValue A string containing the text to replace for every successful match of searchValue in this string.
    */
    StringField.prototype.replace = function (searchValue, replaceValue) {
        return this._value.replace(searchValue, replaceValue);
    };
    /**
    * Finds the first substring match in a regular expression search.
    * @param searcher An object which supports searching within a string.
    */
    StringField.prototype.search = function (searcher) {
        return this._value.search(searcher);
    };
    /**
    * Split a string into substrings using the specified separator and return them as an array.
    * @param splitter An object that can split a string.
    * @param limit A value used to limit the number of elements returned in the array.
    */
    StringField.prototype.split = function (splitter, limit) {
        return this._value.split(splitter, limit);
    };
    /**
    * Returns an <a> HTML anchor element and sets the name attribute to the text value
    * @param name
    */
    StringField.prototype.anchor = function (name) {
        return this._value.anchor(name);
    };
    /** Returns a <big> HTML element */
    StringField.prototype.big = function () {
        return this._value.big();
    };
    /** Returns a <blink> HTML element */
    StringField.prototype.blink = function () {
        return this._value.blink();
    };
    /** Returns a <b> HTML element */
    StringField.prototype.bold = function () {
        return this._value.bold();
    };
    /** Returns a <tt> HTML element */
    StringField.prototype.fixed = function () {
        return this._value.fixed();
    };
    /** Returns a <font> HTML element and sets the color attribute value */
    StringField.prototype.fontcolor = function (color) {
        return this._value.fontcolor(color);
    };
    /** Returns a <font> HTML element and sets the size attribute value */
    StringField.prototype.fontsize = function (size) {
        return this._value.fontsize(size);
    };
    /** Returns an <i> HTML element */
    StringField.prototype.italics = function () {
        return this._value.italics();
    };
    /** Returns an <a> HTML element and sets the href attribute value */
    StringField.prototype.link = function (url) {
        return this._value.link(url);
    };
    /** Returns a <small> HTML element */
    StringField.prototype.small = function () {
        return this._value.small();
    };
    /** Returns a <strike> HTML element */
    StringField.prototype.strike = function () {
        return this._value.strike();
    };
    /** Returns a <sub> HTML element */
    StringField.prototype.sub = function () {
        return this._value.sub();
    };
    /** Returns a <sup> HTML element */
    StringField.prototype.sup = function () {
        return this._value.sup();
    };
    /** Returns a string representation of a string. */
    StringField.prototype.toString = function () {
        return this._value.toString();
    };
    /**
        * Returns the character at the specified index.
        * @param pos The zero-based index of the desired character.
        */
    StringField.prototype.charAt = function (pos) {
        return this._value.charAt(pos);
    };
    /**
        * Returns the Unicode value of the character at the specified location.
        * @param index The zero-based index of the desired character. If there is no character at the specified index, NaN is returned.
        */
    StringField.prototype.charCodeAt = function (index) {
        return this._value.charCodeAt(index);
    };
    /**
        * Returns a string that contains the concatenation of two or more strings.
        * @param strings The strings to append to the end of the string.
        */
    StringField.prototype.concat = function () {
        var strings = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            strings[_i] = arguments[_i];
        }
        return (_a = this._value).concat.apply(_a, strings);
        var _a;
    };
    /**
        * Returns the position of the first occurrence of a substring.
        * @param searchString The substring to search for in the string
        * @param position The index at which to begin searching the String object. If omitted, search starts at the beginning of the string.
        */
    StringField.prototype.indexOf = function (searchString, position) {
        return this._value.indexOf(searchString, position);
    };
    /**
        * Returns the last occurrence of a substring in the string.
        * @param searchString The substring to search for.
        * @param position The index at which to begin searching. If omitted, the search begins at the end of the string.
        */
    StringField.prototype.lastIndexOf = function (searchString, position) {
        return this._value.lastIndexOf(searchString, position);
    };
    /**
        * Determines whether two strings are equivalent in the current locale.
        * @param that String to compare to target string
        */
    StringField.prototype.localeCompare = function (that) {
        return this._value.localeCompare(that);
    };
    /**
        * Returns a section of a string.
        * @param start The index to the beginning of the specified portion of stringObj.
        * @param end The index to the end of the specified portion of stringObj. The substring includes the characters up to, but not including, the character indicated by end.
        * If this value is not specified, the substring continues to the end of stringObj.
        */
    StringField.prototype.slice = function (start, end) {
        return this._value.slice(start, end);
    };
    /**
        * Returns the substring at the specified location within a String object.
        * @param start The zero-based index number indicating the beginning of the substring.
        * @param end Zero-based index number indicating the end of the substring. The substring includes the characters up to, but not including, the character indicated by end.
        * If end is omitted, the characters from start through the end of the original string are returned.
        */
    StringField.prototype.substring = function (start, end) {
        return this._value.substring(start, end);
    };
    /** Converts all the alphabetic characters in a string to lowercase. */
    StringField.prototype.toLowerCase = function () {
        return this._value.toLowerCase();
    };
    /** Converts all alphabetic characters to lowercase, taking into account the host environment's current locale. */
    StringField.prototype.toLocaleLowerCase = function () {
        return this._value.toLocaleLowerCase();
    };
    /** Converts all the alphabetic characters in a string to uppercase. */
    StringField.prototype.toUpperCase = function () {
        return this._value.toUpperCase();
    };
    /** Returns a string where all alphabetic characters have been converted to uppercase, taking into account the host environment's current locale. */
    StringField.prototype.toLocaleUpperCase = function () {
        return this._value.toLocaleUpperCase();
    };
    /** Removes the leading and trailing white space and line terminator characters from a string. */
    StringField.prototype.trim = function () {
        return this._value.trim();
    };
    // IE extensions
    /**
        * Gets a substring beginning at the specified location and having the specified length.
        * @param from The starting position of the desired substring. The index of the first character in the string is zero.
        * @param length The number of characters to include in the returned substring.
        */
    StringField.prototype.substr = function (from, length) {
        return this._value.substr(from, length);
    };
    /** Returns the primitive value of the specified object. */
    StringField.prototype.valueOf = function () {
        return this._value.valueOf();
    };
    StringField.prototype.padStart = function (maxLength, fillString) {
        return null;
    };
    StringField.prototype.padEnd = function (maxLength, fillString) {
        return null;
    };
    return StringField;
}(Field));
exports.String = StringField;
var NumberField = (function (_super) {
    __extends(NumberField, _super);
    function NumberField(data) {
        var _this = _super.call(this) || this;
        _this._value = data;
        return _this;
    }
    NumberField.prototype.get = function () {
        return _super.prototype.get.call(this);
    };
    NumberField.prototype.set = function (value) {
        if (value == null || value == undefined) {
            _super.prototype.set.call(this, null);
        }
        else if (typeof value == 'number' || value instanceof Number) {
            _super.prototype.set.call(this, value.valueOf());
        }
    };
    /**
    * Returns a string representation of an object.
    * @param radix Specifies a radix for converting numeric values to strings. This value is only used for numbers.
    */
    NumberField.prototype.toString = function (radix) {
        return this._value.toString(radix);
    };
    /**
    * Returns a string representing a number in fixed-point notation.
    * @param fractionDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
    */
    NumberField.prototype.toFixed = function (fractionDigits) {
        return this._value.toFixed(fractionDigits);
    };
    /**
    * Returns a string containing a number represented in exponential notation.
    * @param fractionDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
    */
    NumberField.prototype.toExponential = function (fractionDigits) {
        return this._value.toExponential(fractionDigits);
    };
    /**
    * Returns a string containing a number represented either in exponential or fixed-point notation with a specified number of digits.
    * @param precision Number of significant digits. Must be in the range 1 - 21, inclusive.
    */
    NumberField.prototype.toPrecision = function (precision) {
        return this._value.toPrecision(precision);
    };
    /** Returns the primitive value of the specified object. */
    NumberField.prototype.valueOf = function () {
        return this._value.valueOf();
    };
    return NumberField;
}(Field));
exports.Number = NumberField;
var BooleanField = (function (_super) {
    __extends(BooleanField, _super);
    function BooleanField(data) {
        var _this = _super.call(this) || this;
        _this._value = false;
        _this._value = data;
        return _this;
    }
    BooleanField.prototype.get = function () {
        return _super.prototype.get.call(this);
    };
    BooleanField.prototype.set = function (value) {
        if (value == null || value == undefined) {
            _super.prototype.set.call(this, null);
        }
        else {
            _super.prototype.set.call(this, value.valueOf() ? true : false);
        }
    };
    /** Returns the primitive value of the specified object. */
    BooleanField.prototype.valueOf = function () {
        return this._value.valueOf();
    };
    return BooleanField;
}(Field));
exports.Boolean = BooleanField;
var DateField = (function (_super) {
    __extends(DateField, _super);
    function DateField(data) {
        var _this = _super.call(this) || this;
        _this._value = new Date();
        _this._value = data;
        return _this;
    }
    DateField.prototype.get = function () {
        return _super.prototype.get.call(this);
    };
    DateField.prototype.set = function (value) {
        if (value == null || value == undefined) {
            _super.prototype.set.call(this, null);
        }
        else {
            _super.prototype.set.call(this, new Date(value.valueOf()));
        }
    };
    /**
     * Converts a Date object to a string or number.
     *
     * @param hint The strings "number", "string", or "default" to specify what primitive to return.
     *
     * @throws {TypeError} If 'hint' was given something other than "number", "string", or "default".
     * @returns A number if 'hint' was "number", a string if 'hint' was "string" or "default".
     */
    DateField.prototype[Symbol.toPrimitive] = function (hint) {
        return this._value[Symbol.toPrimitive](hint);
    };
    /** Returns a string representation of a date. The format of the string depends on the locale. */
    DateField.prototype.toString = function () {
        return this._value.toString();
    };
    /** Returns a date as a string value. */
    DateField.prototype.toDateString = function () {
        return this._value.toDateString();
    };
    /** Returns a time as a string value. */
    DateField.prototype.toTimeString = function () {
        return this._value.toTimeString();
    };
    /** Returns a value as a string value appropriate to the host environment's current locale. */
    DateField.prototype.toLocaleString = function () {
        return this._value.toLocaleString();
    };
    /** Returns a date as a string value appropriate to the host environment's current locale. */
    DateField.prototype.toLocaleDateString = function () {
        return this._value.toLocaleDateString();
    };
    /** Returns a time as a string value appropriate to the host environment's current locale. */
    DateField.prototype.toLocaleTimeString = function () {
        return this._value.toLocaleTimeString();
    };
    /** Returns the stored time value in milliseconds since midnight, January 1, 1970 UTC. */
    DateField.prototype.valueOf = function () {
        return this._value.valueOf();
    };
    /** Gets the time value in milliseconds. */
    DateField.prototype.getTime = function () {
        return this._value.getTime();
    };
    /** Gets the year, using local time. */
    DateField.prototype.getFullYear = function () {
        return this._value.getFullYear();
    };
    /** Gets the year using Universal Coordinated Time (UTC). */
    DateField.prototype.getUTCFullYear = function () {
        return this._value.getUTCFullYear();
    };
    /** Gets the month, using local time. */
    DateField.prototype.getMonth = function () {
        return this._value.getMonth();
    };
    /** Gets the month of a Date object using Universal Coordinated Time (UTC). */
    DateField.prototype.getUTCMonth = function () {
        return this._value.getUTCMonth();
    };
    /** Gets the day-of-the-month, using local time. */
    DateField.prototype.getDate = function () {
        return this._value.getDate();
    };
    /** Gets the day-of-the-month, using Universal Coordinated Time (UTC). */
    DateField.prototype.getUTCDate = function () {
        return this._value.getUTCDate();
    };
    /** Gets the day of the week, using local time. */
    DateField.prototype.getDay = function () {
        return this._value.getDay();
    };
    /** Gets the day of the week using Universal Coordinated Time (UTC). */
    DateField.prototype.getUTCDay = function () {
        return this._value.getUTCDay();
    };
    /** Gets the hours in a date, using local time. */
    DateField.prototype.getHours = function () {
        return this._value.getHours();
    };
    /** Gets the hours value in a Date object using Universal Coordinated Time (UTC). */
    DateField.prototype.getUTCHours = function () {
        return this._value.getUTCHours();
    };
    /** Gets the minutes of a Date object, using local time. */
    DateField.prototype.getMinutes = function () {
        return this._value.getMinutes();
    };
    /** Gets the minutes of a Date object using Universal Coordinated Time (UTC). */
    DateField.prototype.getUTCMinutes = function () {
        return this._value.getUTCMinutes();
    };
    /** Gets the seconds of a Date object, using local time. */
    DateField.prototype.getSeconds = function () {
        return this._value.getSeconds();
    };
    /** Gets the seconds of a Date object using Universal Coordinated Time (UTC). */
    DateField.prototype.getUTCSeconds = function () {
        return this._value.getUTCSeconds();
    };
    /** Gets the milliseconds of a Date, using local time. */
    DateField.prototype.getMilliseconds = function () {
        return this._value.getMilliseconds();
    };
    /** Gets the milliseconds of a Date object using Universal Coordinated Time (UTC). */
    DateField.prototype.getUTCMilliseconds = function () {
        return this._value.getUTCMilliseconds();
    };
    /** Gets the difference in minutes between the time on the local computer and Universal Coordinated Time (UTC). */
    DateField.prototype.getTimezoneOffset = function () {
        return this._value.getTimezoneOffset();
    };
    /**
        * Sets the date and time value in the Date object.
        * @param time A numeric value representing the number of elapsed milliseconds since midnight, January 1, 1970 GMT.
        */
    DateField.prototype.setTime = function (time) {
        return this._value.setTime(time);
    };
    /**
        * Sets the milliseconds value in the Date object using local time.
        * @param ms A numeric value equal to the millisecond value.
        */
    DateField.prototype.setMilliseconds = function (ms) {
        return this._value.setMilliseconds(ms);
    };
    /**
        * Sets the milliseconds value in the Date object using Universal Coordinated Time (UTC).
        * @param ms A numeric value equal to the millisecond value.
        */
    DateField.prototype.setUTCMilliseconds = function (ms) {
        return this._value.setUTCMilliseconds(ms);
    };
    /**
        * Sets the seconds value in the Date object using local time.
        * @param sec A numeric value equal to the seconds value.
        * @param ms A numeric value equal to the milliseconds value.
        */
    DateField.prototype.setSeconds = function (sec, ms) {
        return this._value.setSeconds(sec, ms);
    };
    /**
        * Sets the seconds value in the Date object using Universal Coordinated Time (UTC).
        * @param sec A numeric value equal to the seconds value.
        * @param ms A numeric value equal to the milliseconds value.
        */
    DateField.prototype.setUTCSeconds = function (sec, ms) {
        return this._value.setUTCSeconds(sec, ms);
    };
    /**
        * Sets the minutes value in the Date object using local time.
        * @param min A numeric value equal to the minutes value.
        * @param sec A numeric value equal to the seconds value.
        * @param ms A numeric value equal to the milliseconds value.
        */
    DateField.prototype.setMinutes = function (min, sec, ms) {
        return this._value.setMinutes(min, sec, ms);
    };
    /**
        * Sets the minutes value in the Date object using Universal Coordinated Time (UTC).
        * @param min A numeric value equal to the minutes value.
        * @param sec A numeric value equal to the seconds value.
        * @param ms A numeric value equal to the milliseconds value.
        */
    DateField.prototype.setUTCMinutes = function (min, sec, ms) {
        return this._value.setUTCMinutes(min, sec, ms);
    };
    /**
        * Sets the hour value in the Date object using local time.
        * @param hours A numeric value equal to the hours value.
        * @param min A numeric value equal to the minutes value.
        * @param sec A numeric value equal to the seconds value.
        * @param ms A numeric value equal to the milliseconds value.
        */
    DateField.prototype.setHours = function (hours, min, sec, ms) {
        return this._value.setHours(hours, min, sec, ms);
    };
    /**
        * Sets the hours value in the Date object using Universal Coordinated Time (UTC).
        * @param hours A numeric value equal to the hours value.
        * @param min A numeric value equal to the minutes value.
        * @param sec A numeric value equal to the seconds value.
        * @param ms A numeric value equal to the milliseconds value.
        */
    DateField.prototype.setUTCHours = function (hours, min, sec, ms) {
        return this._value.setUTCHours(hours, min, sec, ms);
    };
    /**
        * Sets the numeric day-of-the-month value of the Date object using local time.
        * @param date A numeric value equal to the day of the month.
        */
    DateField.prototype.setDate = function (date) {
        return this._value.setDate(date);
    };
    /**
        * Sets the numeric day of the month in the Date object using Universal Coordinated Time (UTC).
        * @param date A numeric value equal to the day of the month.
        */
    DateField.prototype.setUTCDate = function (date) {
        return this._value.setUTCDate(date);
    };
    /**
        * Sets the month value in the Date object using local time.
        * @param month A numeric value equal to the month. The value for January is 0, and other month values follow consecutively.
        * @param date A numeric value representing the day of the month. If this value is not supplied, the value from a call to the getDate method is used.
        */
    DateField.prototype.setMonth = function (month, date) {
        return this._value.setMonth(month, date);
    };
    /**
        * Sets the month value in the Date object using Universal Coordinated Time (UTC).
        * @param month A numeric value equal to the month. The value for January is 0, and other month values follow consecutively.
        * @param date A numeric value representing the day of the month. If it is not supplied, the value from a call to the getUTCDate method is used.
        */
    DateField.prototype.setUTCMonth = function (month, date) {
        return this._value.setUTCMonth(month, date);
    };
    /**
        * Sets the year of the Date object using local time.
        * @param year A numeric value for the year.
        * @param month A zero-based numeric value for the month (0 for January, 11 for December). Must be specified if numDate is specified.
        * @param date A numeric value equal for the day of the month.
        */
    DateField.prototype.setFullYear = function (year, month, date) {
        return this._value.setFullYear(year, month, date);
    };
    /**
        * Sets the year value in the Date object using Universal Coordinated Time (UTC).
        * @param year A numeric value equal to the year.
        * @param month A numeric value equal to the month. The value for January is 0, and other month values follow consecutively. Must be supplied if numDate is supplied.
        * @param date A numeric value equal to the day of the month.
        */
    DateField.prototype.setUTCFullYear = function (year, month, date) {
        return this._value.setUTCFullYear(year, month, date);
    };
    /** Returns a date converted to a string using Universal Coordinated Time (UTC). */
    DateField.prototype.toUTCString = function () {
        return this._value.toUTCString();
    };
    /** Returns a date as a string value in ISO format. */
    DateField.prototype.toISOString = function () {
        return this._value.toISOString();
    };
    /** Used by the JSON.stringify method to enable the transformation of an object's data for JavaScript Object Notation (JSON) serialization. */
    DateField.prototype.toJSON = function (key) {
        if (this._value != null) {
            return moment(this._value).format('DD/MM/YYYY HH:mm:ss.SSS');
        }
        else {
            return null;
        }
    };
    DateField.prototype.getVarDate = function () {
        return this._value.getVarDate();
    };
    return DateField;
}(Field));
exports.Date = DateField;
