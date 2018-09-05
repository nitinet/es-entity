"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aggregation = require("aggregation/es6");
const sql = require("../sql");
class NumberType extends aggregation(Number, sql.Field) {
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (typeof value == 'number' || value instanceof Number) {
            super.set(value.valueOf());
        }
    }
}
exports.default = NumberType;
