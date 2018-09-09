"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const es = require("./../../dist/index");
const Employee_1 = require("./Employee");
const Application_1 = require("./Application");
class EmpContext extends es.Context {
    constructor(config, entityPath) {
        super(config, entityPath);
        this.applications = new es.collection.DBSet(Application_1.default);
        this.employees = new es.collection.DBSet(Employee_1.default);
    }
}
exports.default = EmpContext;
