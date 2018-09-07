"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require("../sql");
class JsonType extends sql.Field {
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
exports.default = JsonType;
