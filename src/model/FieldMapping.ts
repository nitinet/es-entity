import ColumnType from '../bean/ColumnType.js';

class FieldMapping {
	fieldName: string;
	colName: string;
	columnType: ColumnType;
	primaryKey: boolean = false;

	constructor(fieldName: string, colName: string, columnType: ColumnType, primaryKey: boolean) {
		this.fieldName = fieldName;
		this.colName = colName;
		this.columnType = columnType
		this.primaryKey = primaryKey;
	}
}

export default FieldMapping;
