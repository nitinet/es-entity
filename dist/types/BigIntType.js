"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Field_1 = require("../sql/Field");
const bean = require("../bean");
class BigIntType extends Field_1.default {
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
                return BigIntType.prototype;
            }
        });
    }
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (typeof value == 'bigint') {
            super.set(value);
        }
        else if (typeof value == 'number' || typeof value == 'string') {
            super.set(BigInt(value));
        }
        else {
            throw new bean.SqlException('Invalid BigInt Value: ' + value);
        }
    }
}
exports.default = BigIntType;
//# sourceMappingURL=BigIntType.js.map