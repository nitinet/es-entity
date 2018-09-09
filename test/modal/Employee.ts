import * as es from './../../dist/index';

import Application from './Application';

class Employee {
	id = new es.types.Number();
	appId = new es.types.Number();
	name = new es.types.String();
	description = new es.types.String();
	crtdAt = new es.types.Date();

	application = new es.collection.ForeignSet<Application>(Application, (a: Application, emp: Employee[]) => {
		return a.id.eq(emp[0].appId.get());
	});
}

export default Employee;
