"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Field_1 = require("../sql/Field");
const bean = require("../bean");
class BooleanType extends Field_1.default {
    constructor(data) {
        super();
        this.set(data);
    }
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (typeof value == 'boolean') {
            super.set(!!value);
        }
        else {
            throw new bean.SqlException('Invalid Boolean Value');
        }
    }
}
exports.default = BooleanType;
