import * as es from "./../../index";
import Employee from "./Employee";

class EmpContext extends es.Context {
    constructor(config?: es.ConnectionConfig, entityPath?: string) {
        super(config, entityPath);
        this.init();
    }

    employees: es.DBSet<Employee> = new es.DBSet<Employee>(Employee);
}

export default EmpContext;
