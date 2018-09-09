"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require("../sql/Expression");
class NumberType extends sql.Field {
    constructor(data) {
        super();
        this._value = data;
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
exports.default = NumberType;
