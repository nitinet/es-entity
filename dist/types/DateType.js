"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Field_1 = require("../sql/Field");
class DateType extends Field_1.default {
    constructor(data) {
        super();
        if (data instanceof Date) {
            this._value = data;
        }
        else {
            this._value = new Date(data);
        }
        return new Proxy(this, {
            get(target, prop) {
                if (prop in target) {
                    return target[prop];
                }
                else if (target._value) {
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
        else if (value instanceof Date) {
            super.set(value);
        }
    }
}
exports.default = DateType;
//# sourceMappingURL=DateType.js.map