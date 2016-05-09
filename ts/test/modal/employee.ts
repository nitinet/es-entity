import * as es from "./../../index";

class Employee extends es.Entity {
    constructor() {
        super();
    }

    id: number;
    name: string;
    description: string;
}

export default Employee;
