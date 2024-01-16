import * as model from '../model/index.js';

class DBSet {

	tableName: string = '';
	fieldMap = new Map<string, model.FieldMapping>();

	filterFields(props: (string | symbol)[]) {
		let fields = Array.from(this.fieldMap.values());
		return fields.filter(f => props.includes(f.fieldName));
	}

}

export default DBSet;
