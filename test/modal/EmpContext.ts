import * as es from './../../types/index';
import Employee from './Employee';

class EmpContext extends es.Context {
	constructor(config, entityPath?: string) {
		super(config, entityPath);
	}

	employees: es.collection.DBSet<Employee> = new es.collection.DBSet<Employee>(Employee);
}

export default EmpContext;
