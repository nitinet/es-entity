"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require("../sql/Expression");
class BooleanType extends sql.Field {
    constructor(data) {
        super();
        if (data) {
            this._value = data.valueOf() ? true : false;
        }
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
        return this._value;
    }
}
exports.default = BooleanType;
