"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aggregation = require("aggregation/es6");
const sql = require("../sql");
class BooleanType extends aggregation(Boolean, sql.Field) {
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else {
            super.set(value.valueOf() ? true : false);
        }
    }
}
exports.default = BooleanType;
