import Field from '../sql/Field';
import * as bean from '../bean';

class ObjectType extends Field<object> {

	constructor(data?: Object) {
		super();
		this.set(data);
	}

	set(value: object | Object) {
		if (value == null || value == undefined) {
			super.set(null);
		} else if (typeof value == 'object') {
			super.set(value);
		} else {
			throw new bean.SqlException('Invalid Object Value');
		}
	}

}

export default ObjectType;
