import * as es from "./../../index";
import Application from './Application';

class Employee {
    id: es.Type.Number = new es.Type.Number();
    name: es.Type.String = new es.Type.String();
    description: es.Type.String = new es.Type.String();
    crtdAt: es.Type.Date = new es.Type.Date();

    constructor() {
    }
}

export default Employee;
