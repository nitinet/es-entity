"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require("../sql/Expression");
class DateType extends sql.Field {
    constructor(data) {
        super();
        this._value = data;
    }
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (value instanceof Date) {
            super.set(value);
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
            return moment(this._value).format('DD/MM/YYYY HH:mm:ss.SSS');
        }
        else {
            return null;
        }
    }
    getVarDate() {
        return this._value.getVarDate();
    }
}
exports.default = DateType;
