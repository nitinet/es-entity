"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Field_1 = require("../sql/Field");
const bean = require("../bean");
class NumberType extends Field_1.default {
    constructor(data) {
        super();
        this.set(data);
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
                return NumberType.prototype;
            }
        });
    }
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (typeof value == 'number' || typeof value == 'bigint') {
            super.set(value);
        }
        else {
            throw new bean.SqlException('Invalid Number Value');
        }
    }
}
exports.default = NumberType;
//# sourceMappingURL=NumberType.js.map