import Case from 'case';

import * as bean from '../bean/index.js';
import * as types from '../model/types.js';
import * as model from '../model/index.js';
import Context from '../Context.js';

class DBSet<T extends Object>  {
	protected entityType: types.IEntityType<T>;

	// mapping: Mapping.EntityMapping = new Mapping.EntityMapping();
	tableName: string;
	entityName: string;
	columns: bean.ColumnInfo[] = [];
	fieldMap = new Map<string, model.FieldMapping>();
	private primaryFields: model.FieldMapping[] = [];

	constructor(entityType: types.IEntityType<T>, tableName?: string) {
		this.entityType = entityType;
		this.entityName = this.entityType.name;
		this.tableName = tableName ?? Case.snake(this.entityName);
	}

	async bind(context: Context) {
		// get info from describe db
		this.columns = await context.handler.getTableInfo(this.tableName);

		let obj = new this.entityType();
		let keys = (<string[]>Reflect.ownKeys(obj));

		// Bind Fields
		keys.forEach(key => {
			this.bindField(key);
		});

		return this;
	}

	private bindField(key: string) {
		let snakeCaseKey = Case.snake(key);
		let column = this.columns.find(col => col.field == key || col.field == snakeCaseKey);

		if (!column) return;

		this.checkColumnType(column, key);
		let fieldMapping = new model.FieldMapping(key, column.field, column.type, column.primaryKey);
		this.fieldMap.set(key, fieldMapping);
		if (column.primaryKey) this.primaryFields.push(fieldMapping);
	}

	private checkColumnType(column: bean.ColumnInfo, key: string) {
		let obj = new this.entityType();
		let designType = Reflect.getMetadata('design:type', obj, key);
		if (designType) {
			if ((column.type == bean.ColumnType.STRING && designType != String)
				|| (column.type == bean.ColumnType.NUMBER && designType != Number)
				|| (column.type == bean.ColumnType.BOOLEAN && designType != Boolean)
				|| (column.type == bean.ColumnType.DATE && designType != Date)
				|| (column.type == bean.ColumnType.BINARY && designType != Buffer)
				|| (column.type == bean.ColumnType.ARRAY && designType != Array)
				|| (column.type == bean.ColumnType.OBJECT
					&& (designType != Array || !(designType.prototype instanceof Object))))
				throw new Error(`Type mismatch found for Column: ${column.field} in Table:${this.tableName}`);
		}
	}

	getEntityType() {
		return this.entityType;
	}

	getField(key: string) {
		return this.fieldMap.get(key);
	}

	getPrimaryFields() {
		return this.primaryFields;
	}

	filterFields(props: (string | symbol)[]) {
		let fields = Array.from(this.fieldMap.values());
		return fields.filter(f => props.includes(f.fieldName));
	}

}

export default DBSet;
