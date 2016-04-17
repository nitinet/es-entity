import * as es from "./../../index";

class Employee extends es.Entity {
    constructor() {
        super();
    }

    id: es.Field;
    name: es.Field;
    description: es.Field;
}

export default Employee;