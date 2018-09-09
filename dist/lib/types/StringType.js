"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require("../sql/Expression");
class StringType extends sql.Field {
    constructor(data) {
        super();
        this._value = data;
    }
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (typeof value == 'string' || value instanceof String) {
            super.set(value);
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
exports.default = StringType;
