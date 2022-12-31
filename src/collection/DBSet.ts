import Case from 'case';

import * as bean from '../bean/index.js';
import * as types from '../model/types.js';
import * as model from '../model/index.js';
import Context from '../Context.js';

interface IOptions {
	entityName?: string;
	entityPath?: string,
}

class DBSet<T extends model.Entity>  {
	protected entityType: types.IEntityType<T>;

	// mapping: Mapping.EntityMapping = new Mapping.EntityMapping();
	tableName: string = null;
	entityName: string = null;
	fieldMap = new Map<string | symbol, model.FieldMapping>();
	private primaryFields: model.FieldMapping[] = [];

	constructor(entityType: types.IEntityType<T>) {
		this.entityType = entityType;
	}

	async bind(context: Context, tableName?: string) {
		this.entityName = this.entityType.name;
		this.tableName = tableName ?? Case.snake(this.entityName);

		// get info from describe db
		let columns = await context.handler.getTableInfo(this.tableName);

		let obj = new this.entityType();
		let keys = (<string[]>Reflect.ownKeys(obj));

		keys.forEach(key => {
			// Bind Fields
			try {
				this.bindField(key, columns);
			} catch (err) {
				context.log(err);
			}
		});

		return this;
	}

	private bindField(key: string, tableColumns: bean.ColumnInfo[]) {
		let snakeCaseKey = Case.snake(key);
		let column = tableColumns.find(col => col.field == key || col.field == snakeCaseKey);

		if (!column) throw new Error(`Column: ${key} not found in Table: ${this.tableName}`);

		let fieldMapping = new model.FieldMapping(key, column.field, column.primaryKey);
		// fieldMapping.type = this.checkColumnType(column, field);
		this.fieldMap.set(key, fieldMapping);
		if (column.primaryKey) this.primaryFields.push(fieldMapping);
	}

	// private checkColumnType(column: bean.ColumnInfo, field: sql.Field<any>) {
	// 	if (column.type == bean.ColumnType.STRING && field instanceof types.String) {
	// 		return 'string';
	// 	} else if (column.type == bean.ColumnType.NUMBER && field instanceof types.Number) {
	// 		return 'number';
	// 	} else if (column.type == bean.ColumnType.NUMBER && field instanceof types.BigInt) {
	// 		return 'bigint';
	// 	} else if (column.type == bean.ColumnType.BOOLEAN && field instanceof types.Boolean) {
	// 		return 'boolean';
	// 	} else if (column.type == bean.ColumnType.DATE && field instanceof types.Date) {
	// 		return 'date';
	// 	} else if (column.type == bean.ColumnType.BINARY && field instanceof types.Binary) {
	// 		return 'binary';
	// 	} else if (column.type == bean.ColumnType.JSON && field instanceof types.Json) {
	// 		return 'jsonObject';
	// 	} else if (field instanceof types.String) {
	// 		this.context.log(`Type not found for Column: ${column.field} in Table:${this.mapping.name}. Using default string type.`);
	// 		return 'string';
	// 	} else {
	// 		throw new Error(`Type mismatch found for Column: ${column.field} in Table:${this.mapping.name}`);
	// 	}
	// }

	getEntityType() {
		return this.entityType;
	}

	getField(key: string | symbol) {
		return this.fieldMap.get(key);
	}

	getPrimaryFields() {
		return this.primaryFields;
	}

	filterFields(props: string[]) {
		let fields = Array.from(this.fieldMap.values());
		return fields.filter(f => props.includes(f.fieldName));
	}

}

export default DBSet;
