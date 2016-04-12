"use strict";
const es = require("./../../index");
const employee_1 = require("./employee");
class default_1 extends es.context {
    constructor(...args) {
        super(...args);
        this.employees = new es.queryable(employee_1.default);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
