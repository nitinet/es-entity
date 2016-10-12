"use strict";
const es = require("./../../index");
class Employee {
    constructor() {
        this.id = new es.Type.Number();
        this.name = new es.Type.String();
        this.description = new es.Type.String();
        this.crtdAt = new es.Type.Date();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Employee;
