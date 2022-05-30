"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Field_1 = require("../sql/Field");
const bean = require("../bean");
class BigIntType extends Field_1.default {
    constructor(data) {
        super();
        this.set(data);
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
