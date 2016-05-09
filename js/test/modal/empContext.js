"use strict";
const es = require("./../../index");
const Employee_1 = require("./Employee");
class EmpContext extends es.Context {
    constructor() {
        super();
        this.employees = new es.Queryable(Employee_1.default);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EmpContext;
