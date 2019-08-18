"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require("../sql/Expression");
class JsonType extends sql.Field {
    constructor(data) {
        super();
        this.set(data);
    }
    get() {
        return this._value;
    }
    set(value) {
        if (value != undefined) {
            let v = JSON.parse(value);
            if (v !== this._value) {
                this._updated = true;
                this._value = v;
            }
        }
    }
    toJSON() {
        return this._value;
    }
}
exports.default = JsonType;
