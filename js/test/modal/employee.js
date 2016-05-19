"use strict";
const es = require("./../../index");
class Employee {
    constructor() {
        this.id = new es.Field();
        this.name = new es.Field();
        this.description = new es.Field();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Employee;
