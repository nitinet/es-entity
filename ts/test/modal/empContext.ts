import * as es from "./../../index";
import Employee from "./Employee";

class EmpContext extends es.Context {
    constructor() {
        super();
    }

    employees: es.DBSet<Employee> = new es.DBSet<Employee>(Employee);
}

export default EmpContext;
