"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aggregation = require("aggregation/es6");
const sql = require("../sql/Expression");
class BooleanType extends aggregation(Boolean, sql.Field) {
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (typeof value == 'boolean' || value instanceof Boolean) {
            super.set(value);
        }
    }
}
exports.default = BooleanType;
