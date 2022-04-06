"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Field_1 = require("../sql/Field");
const bean = require("../bean");
class DateType extends Field_1.default {
    constructor(data) {
        super();
        this.set(data);
    }
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (value instanceof Date) {
            super.set(value);
        }
        else {
            throw new bean.SqlException('Invalid Date Value');
        }
    }
}
exports.default = DateType;
//# sourceMappingURL=DateType.js.map