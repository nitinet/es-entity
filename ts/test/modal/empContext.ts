import * as es from "./../../index";
import Employee from "./Employee";

class EmpContext extends es.Context {
    constructor() {
        super();
    }

    employees: es.Queryable<Employee> = new es.Queryable<Employee>(Employee);
}

export default EmpContext;
