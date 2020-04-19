"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require("../sql/Expression");
class BooleanType extends sql.Field {
    constructor(data) {
        super();
        this.set(data);
        return new Proxy(this, {
            get(target, prop) {
                if (prop in target) {
                    return target[prop];
                }
                else if (prop in target._value) {
                    return target._value[prop];
                }
            },
            getPrototypeOf() {
                return sql.Field.prototype;
            }
        });
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
}
exports.default = BooleanType;
