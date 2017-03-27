"use strict";
const moment = require("moment");
const Query = require("./Query");
class Field extends Query.Column {
    constructor() {
        super();
        this._value = null;
        this._alias = "";
        this._name = "";
        this._updated = false;
    }
    get() {
        return this._value;
    }
    set(value) {
        if (value !== this._value) {
            this._updated = true;
            this._value = value;
        }
    }
    toJSON() {
        if (this._value != null) {
            return this._value.valueOf();
        }
        else {
            return null;
        }
    }
    _createExpr() {
        let name = this._alias ? this._alias + "." + this._name : this._name;
        return new Query.SqlExpression(name);
    }
    _argExp(operand) {
        let w = null;
        if (operand instanceof Query.Column) {
            w = operand._createExpr();
        }
        else {
            w = new Query.SqlExpression("?");
            w.args = w.args.concat(operand);
        }
        return w;
    }
    eq(operand) {
        return new Query.SqlExpression(null, Query.Operator.Equal, this._createExpr(), this._argExp(operand));
    }
    neq(operand) {
        return new Query.SqlExpression(null, Query.Operator.NotEqual, this._createExpr(), this._argExp(operand));
    }
    lt(operand) {
        return new Query.SqlExpression(null, Query.Operator.LessThan, this._createExpr(), this._argExp(operand));
    }
    gt(operand) {
        return new Query.SqlExpression(null, Query.Operator.GreaterThan, this._createExpr(), this._argExp(operand));
    }
    lteq(operand) {
        return new Query.SqlExpression(null, Query.Operator.LessThanEqual, this._createExpr(), this._argExp(operand));
    }
    gteq(operand) {
        return new Query.SqlExpression(null, Query.Operator.GreaterThanEqual, this._createExpr(), this._argExp(operand));
    }
    and(operand) {
        return new Query.SqlExpression(null, Query.Operator.And, this._createExpr(), this._argExp(operand));
    }
    or(operand) {
        return new Query.SqlExpression(null, Query.Operator.Or, this._createExpr(), this._argExp(operand));
    }
    not() {
        return new Query.SqlExpression(null, Query.Operator.Not, this._createExpr());
    }
    in(...operand) {
        let arg = new Query.SqlExpression(null, Query.Operator.Comma);
        for (let i = 0; i < operand.length; i++) {
            arg.exps.push(this._argExp(operand[i]));
        }
        return new Query.SqlExpression(null, Query.Operator.In, this._createExpr(), arg);
    }
    between(first, second) {
        return new Query.SqlExpression(null, Query.Operator.Between, this._createExpr(), this._argExp(first), this._argExp(second));
    }
    like(operand) {
        return new Query.SqlExpression(null, Query.Operator.Like, this._createExpr(), this._argExp(operand));
    }
    IsNull() {
        return new Query.SqlExpression(null, Query.Operator.IsNull, this._createExpr());
    }
    IsNotNull() {
        return new Query.SqlExpression(null, Query.Operator.IsNotNull, this._createExpr());
    }
    plus(operand) {
        return new Query.SqlExpression(null, Query.Operator.Plus, this._createExpr(), this._argExp(operand));
    }
    minus(operand) {
        return new Query.SqlExpression(null, Query.Operator.Minus, this._createExpr(), this._argExp(operand));
    }
    multiply(operand) {
        return new Query.SqlExpression(null, Query.Operator.Multiply, this._createExpr(), this._argExp(operand));
    }
    devide(operand) {
        return new Query.SqlExpression(null, Query.Operator.Devide, this._createExpr(), this._argExp(operand));
    }
    asc() {
        return new Query.SqlExpression(null, Query.Operator.Asc, this._createExpr());
    }
    desc() {
        return new Query.SqlExpression(null, Query.Operator.Desc, this._createExpr());
    }
    sum() {
        return new Query.SqlExpression(null, Query.Operator.Sum, this._createExpr());
    }
    min() {
        return new Query.SqlExpression(null, Query.Operator.Min, this._createExpr());
    }
    max() {
        return new Query.SqlExpression(null, Query.Operator.Max, this._createExpr());
    }
    count() {
        return new Query.SqlExpression(null, Query.Operator.Count, this._createExpr());
    }
    average() {
        return new Query.SqlExpression(null, Query.Operator.Avg, this._createExpr());
    }
}
exports.Field = Field;
class StringField extends Field {
    constructor(data) {
        super();
        this._value = "";
        this._value = data;
    }
    get() {
        return super.get();
    }
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (typeof value == 'string' || value instanceof String) {
            super.set(value.valueOf());
        }
    }
    [Symbol.iterator]() {
        return this._value[Symbol.iterator]();
    }
    codePointAt(pos) {
        return this._value.codePointAt(pos);
    }
    includes(searchString, position) {
        return this._value.includes(searchString, position);
    }
    endsWith(searchString, endPosition) {
        return this._value.endsWith(searchString, endPosition);
    }
    normalize(form) {
        return this._value.normalize(form);
    }
    repeat(count) {
        return this._value.repeat(count);
    }
    startsWith(searchString, position) {
        return this._value.startsWith(searchString, position);
    }
    match(matcher) {
        return this._value.match(matcher);
    }
    replace(searchValue, replaceValue) {
        return this._value.replace(searchValue, replaceValue);
    }
    search(searcher) {
        return this._value.search(searcher);
    }
    split(splitter, limit) {
        return this._value.split(splitter, limit);
    }
    anchor(name) {
        return this._value.anchor(name);
    }
    big() {
        return this._value.big();
    }
    blink() {
        return this._value.blink();
    }
    bold() {
        return this._value.bold();
    }
    fixed() {
        return this._value.fixed();
    }
    fontcolor(color) {
        return this._value.fontcolor(color);
    }
    fontsize(size) {
        return this._value.fontsize(size);
    }
    italics() {
        return this._value.italics();
    }
    link(url) {
        return this._value.link(url);
    }
    small() {
        return this._value.small();
    }
    strike() {
        return this._value.strike();
    }
    sub() {
        return this._value.sub();
    }
    sup() {
        return this._value.sup();
    }
    toString() {
        return this._value.toString();
    }
    charAt(pos) {
        return this._value.charAt(pos);
    }
    charCodeAt(index) {
        return this._value.charCodeAt(index);
    }
    concat(...strings) {
        return this._value.concat(...strings);
    }
    indexOf(searchString, position) {
        return this._value.indexOf(searchString, position);
    }
    lastIndexOf(searchString, position) {
        return this._value.lastIndexOf(searchString, position);
    }
    localeCompare(that) {
        return this._value.localeCompare(that);
    }
    slice(start, end) {
        return this._value.slice(start, end);
    }
    substring(start, end) {
        return this._value.substring(start, end);
    }
    toLowerCase() {
        return this._value.toLowerCase();
    }
    toLocaleLowerCase() {
        return this._value.toLocaleLowerCase();
    }
    toUpperCase() {
        return this._value.toUpperCase();
    }
    toLocaleUpperCase() {
        return this._value.toLocaleUpperCase();
    }
    trim() {
        return this._value.trim();
    }
    substr(from, length) {
        return this._value.substr(from, length);
    }
    valueOf() {
        return this._value.valueOf();
    }
    padStart(maxLength, fillString) {
        return null;
    }
    padEnd(maxLength, fillString) {
        return null;
    }
}
exports.String = StringField;
class NumberField extends Field {
    constructor(data) {
        super();
        this._value = data;
    }
    get() {
        return super.get();
    }
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (typeof value == 'number' || value instanceof Number) {
            super.set(value.valueOf());
        }
    }
    toString(radix) {
        return this._value.toString(radix);
    }
    toFixed(fractionDigits) {
        return this._value.toFixed(fractionDigits);
    }
    toExponential(fractionDigits) {
        return this._value.toExponential(fractionDigits);
    }
    toPrecision(precision) {
        return this._value.toPrecision(precision);
    }
    valueOf() {
        return this._value.valueOf();
    }
}
exports.Number = NumberField;
class BooleanField extends Field {
    constructor(data) {
        super();
        this._value = false;
        this._value = data;
    }
    get() {
        return super.get();
    }
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else {
            super.set(value.valueOf() ? true : false);
        }
    }
    valueOf() {
        return this._value.valueOf();
    }
}
exports.Boolean = BooleanField;
class DateField extends Field {
    constructor(data) {
        super();
        this._value = new Date();
        this._value = data;
    }
    get() {
        return super.get();
    }
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else {
            super.set(new Date(value.valueOf()));
        }
    }
    [Symbol.toPrimitive](hint) {
        return this._value[Symbol.toPrimitive](hint);
    }
    toString() {
        return this._value.toString();
    }
    toDateString() {
        return this._value.toDateString();
    }
    toTimeString() {
        return this._value.toTimeString();
    }
    toLocaleString() {
        return this._value.toLocaleString();
    }
    toLocaleDateString() {
        return this._value.toLocaleDateString();
    }
    toLocaleTimeString() {
        return this._value.toLocaleTimeString();
    }
    valueOf() {
        return this._value.valueOf();
    }
    getTime() {
        return this._value.getTime();
    }
    getFullYear() {
        return this._value.getFullYear();
    }
    getUTCFullYear() {
        return this._value.getUTCFullYear();
    }
    getMonth() {
        return this._value.getMonth();
    }
    getUTCMonth() {
        return this._value.getUTCMonth();
    }
    getDate() {
        return this._value.getDate();
    }
    getUTCDate() {
        return this._value.getUTCDate();
    }
    getDay() {
        return this._value.getDay();
    }
    getUTCDay() {
        return this._value.getUTCDay();
    }
    getHours() {
        return this._value.getHours();
    }
    getUTCHours() {
        return this._value.getUTCHours();
    }
    getMinutes() {
        return this._value.getMinutes();
    }
    getUTCMinutes() {
        return this._value.getUTCMinutes();
    }
    getSeconds() {
        return this._value.getSeconds();
    }
    getUTCSeconds() {
        return this._value.getUTCSeconds();
    }
    getMilliseconds() {
        return this._value.getMilliseconds();
    }
    getUTCMilliseconds() {
        return this._value.getUTCMilliseconds();
    }
    getTimezoneOffset() {
        return this._value.getTimezoneOffset();
    }
    setTime(time) {
        return this._value.setTime(time);
    }
    setMilliseconds(ms) {
        return this._value.setMilliseconds(ms);
    }
    setUTCMilliseconds(ms) {
        return this._value.setUTCMilliseconds(ms);
    }
    setSeconds(sec, ms) {
        return this._value.setSeconds(sec, ms);
    }
    setUTCSeconds(sec, ms) {
        return this._value.setUTCSeconds(sec, ms);
    }
    setMinutes(min, sec, ms) {
        return this._value.setMinutes(min, sec, ms);
    }
    setUTCMinutes(min, sec, ms) {
        return this._value.setUTCMinutes(min, sec, ms);
    }
    setHours(hours, min, sec, ms) {
        return this._value.setHours(hours, min, sec, ms);
    }
    setUTCHours(hours, min, sec, ms) {
        return this._value.setUTCHours(hours, min, sec, ms);
    }
    setDate(date) {
        return this._value.setDate(date);
    }
    setUTCDate(date) {
        return this._value.setUTCDate(date);
    }
    setMonth(month, date) {
        return this._value.setMonth(month, date);
    }
    setUTCMonth(month, date) {
        return this._value.setUTCMonth(month, date);
    }
    setFullYear(year, month, date) {
        return this._value.setFullYear(year, month, date);
    }
    setUTCFullYear(year, month, date) {
        return this._value.setUTCFullYear(year, month, date);
    }
    toUTCString() {
        return this._value.toUTCString();
    }
    toISOString() {
        return this._value.toISOString();
    }
    toJSON(key) {
        if (this._value != null) {
            return moment(this._value).format('llll');
        }
        else {
            return null;
        }
    }
}
exports.Date = DateField;
