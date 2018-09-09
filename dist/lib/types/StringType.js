"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aggregation = require("aggregation/es6");
const sql = require("../sql/Expression");
class StringType extends aggregation(String, sql.Field) {
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (typeof value == 'string' || value instanceof String) {
            super.set(value);
        }
    }
}
exports.default = StringType;
