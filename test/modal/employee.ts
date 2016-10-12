import * as es from "./../../index";

class Employee {
    constructor() {
    }

    id: es.Type.Number = new es.Type.Number();
    name: es.Type.String = new es.Type.String();
    description: es.Type.String = new es.Type.String();
    crtdAt: es.Type.Date = new es.Type.Date();
}

export default Employee;
