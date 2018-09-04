import * as es from './../../types/index';

import Application from './Application';

class Employee {
    id = new es.Type.Number();
    appId = new es.Type.Number();
    name = new es.Type.String();
    description = new es.Type.String();
    crtdAt = new es.Type.Date();
}

export default Employee;
