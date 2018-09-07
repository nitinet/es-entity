import * as es from './../../types/index';

import Application from './Application';

class Employee {
	id = new es.types.Number();
	appId = new es.types.Number();
	name = new es.types.String();
	description = new es.types.String();
	crtdAt = new es.types.Date();

	application = new es.collection.ForeignSet<Application>(Application, (a, emp: Employee) => {
		return emp.appId.eq(a.id);
	});
}

export default Employee;
