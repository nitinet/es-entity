"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Field_1 = require("../sql/Field");
class StringType extends Field_1.default {
    constructor(data) {
        super();
        this._value = data;
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
                return Field_1.default.prototype;
            }
        });
    }
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
//# sourceMappingURL=StringType.js.map