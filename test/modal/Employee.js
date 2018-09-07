"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const es = require("./../../types/index");
const Application_1 = require("./Application");
class Employee {
    constructor() {
        this.id = new es.types.Number();
        this.appId = new es.types.Number();
        this.name = new es.types.String();
        this.description = new es.types.String();
        this.crtdAt = new es.types.Date();
        this.application = new es.collection.ForeignSet(Application_1.default, (a, emp) => {
            return emp.appId.eq(a.id);
        });
    }
}
exports.default = Employee;
