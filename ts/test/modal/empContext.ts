import * as es from "./../../index";
import employee from "./Employee";

class EmpContext extends es.Context {
    constructor(config?: any, mappingPath?: string) {
        super(config, mappingPath);
    }

    employees: es.Queryable = new es.Queryable(employee);
}

export default EmpContext;