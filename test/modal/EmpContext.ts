import * as es from './../../dist/index';
import Employee from './Employee';
import Application from './Application';

class EmpContext extends es.Context {
	constructor(config, entityPath?: string) {
		super(config, entityPath);
	}

	applications = new es.collection.DBSet<Application>(Application);
	employees = new es.collection.DBSet<Employee>(Employee);
}

export default EmpContext;
