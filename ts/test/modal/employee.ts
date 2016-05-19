import * as es from "./../../index";

class Employee {
    constructor() {
    }

    id: es.Field = new es.Field();
    name: es.Field = new es.Field();
    description: es.Field = new es.Field();
}

export default Employee;
