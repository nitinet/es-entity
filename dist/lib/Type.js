"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aggregation = require("aggregation/es6");
const Query = require("./Query");
class JsonField extends Query.Field {
    constructor(data) {
        super();
        this._value = null;
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
exports.Json = JsonField;
class StringField extends aggregation(String, Query.Field) {
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (typeof value == 'string' || value instanceof String) {
            super.set(value.valueOf());
        }
    }
}
exports.String = StringField;
class NumberField extends aggregation(Number, Query.Field) {
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (typeof value == 'number' || value instanceof Number) {
            super.set(value.valueOf());
        }
    }
}
exports.Number = NumberField;
class BooleanField extends aggregation(Boolean, Query.Field) {
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else {
            super.set(value.valueOf() ? true : false);
        }
    }
}
exports.Boolean = BooleanField;
class DateField extends aggregation(Date, Query.Field) {
    constructor(data) {
        super();
    }
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (value instanceof Date) {
            super.set(value);
        }
    }
}
exports.Date = DateField;
