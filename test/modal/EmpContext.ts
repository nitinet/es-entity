import * as es from './../../types/index';
import Employee from './Employee';

class EmpContext extends es.Context {
	constructor(config, entityPath?: string) {
		super(config, entityPath);
	}

	employees: es.DBSet<Employee> = new es.DBSet<Employee>(Employee);
}

export default EmpContext;
