"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require("../sql/Expression");
class BooleanType extends sql.Field {
    constructor(data) {
        super();
        this.set(data);
    }
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (typeof value == 'boolean' || value instanceof Boolean) {
            super.set(value);
        }
        else {
            super.set(value ? true : false);
        }
    }
    valueOf() {
        return this._value;
    }
}
exports.default = BooleanType;
