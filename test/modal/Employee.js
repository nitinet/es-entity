"use strict";
const es = require("./../../index");
class Employee {
    constructor() {
        this.id = new es.Number();
        this.name = new es.String();
        this.description = new es.String();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Employee;
