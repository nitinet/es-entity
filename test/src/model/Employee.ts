import * as es from 'es-entity';

@es.decorators.Table('employee')
class Employee {

	@es.decorators.Id
	@es.decorators.Column()
	id!: number;

	@es.decorators.Column()
	name!: string;

	@es.decorators.Column('crtd_at')
	crtdAt!: Date;

}

export default Employee;
