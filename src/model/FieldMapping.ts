class FieldMapping {
	fieldName: string;
	colName: string;
	// type: string = null;
	primaryKey: boolean = false;

	constructor(fieldName: string, colName: string, primaryKey: boolean) {
		this.fieldName = fieldName;
		this.colName = colName;
		this.primaryKey = primaryKey;
	}
}

export default FieldMapping;
