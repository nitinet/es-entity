import * as fs from 'fs';
import * as path from 'path';
import Case from 'case';

import * as bean from '../bean/index.js';
import * as sql from '../sql/index.js';
import * as types from '../types/index.js';
import * as Mapping from '../Mapping.js';
import * as model from '../model/index.js';
import IQuerySet from './IQuerySet.js';
import QuerySet from './QuerySet.js';

interface IOptions {
	entityName?: string;
	entityPath?: string,
}

class DBSet<T extends Object> extends IQuerySet<T> {
	protected entityType: types.IEntityType<T>;
	protected options: IOptions = null;

	mapping: Mapping.EntityMapping = new Mapping.EntityMapping();

	private columns: bean.ColumnInfo[] = null;

	constructor(entityType: types.IEntityType<T>, options?: IOptions) {
		super();

		this.entityType = entityType;
		this.options = options || {};

		this.options.entityName = this.options.entityName || this.entityType.name;
	}

	async bind() {
		let filePath: string = null;
		if (this.options.entityPath) {
			filePath = this.options.entityPath;
		} else if (this.context.getEntityPath()) {
			filePath = path.join(this.context.getEntityPath(), this.options.entityName + '.json');
		}
		if (filePath && fs.statSync(filePath).isFile()) {
			let data = fs.readFileSync(filePath, 'utf-8');
			this.mapping = new Mapping.EntityMapping(JSON.parse(data));
		} else {
			this.mapping = new Mapping.EntityMapping();
			this.mapping.entityName = this.options.entityName;
			this.mapping.name = Case.snake(this.options.entityName);

			// get info from describe db
			this.columns = await this.context.handler.getTableInfo(this.mapping.name);

			let obj = new this.entityType();
			let keys = (<string[]>Reflect.ownKeys(obj));
			keys.forEach(key => {
				// Bind Fields
				this.bindField(key);
			});
		}
		return this;
	}

	private bindField(key: string) {
		let colName = Case.snake(key);
		let column = this.columns.find(col => {
			return col.field == colName;
		});

		try {
			if (!column) {
				throw new Error(`Column: ${colName} not found in Table: ${this.mapping.name}`);
			}
			let fieldMapping = new Mapping.FieldMapping({
				fieldName: key,
				colName: colName
			});
			// fieldMapping.type = this.checkColumnType(column, field);
			if (column.primaryKey) { fieldMapping.primaryKey = true; }
			this.mapping.fields.push(fieldMapping);
		} catch (err) {
			this.context.log(err);
		}
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

	getKeyField(key: string | symbol) {
		return this.mapping.fields.find(a => a.fieldName == key);
	}

	getEntity(alias?: string) {
		let a = new this.entityType();
		let keys = Reflect.ownKeys(a);
		keys.forEach(key => {
			let field = Reflect.get(a, key);
			if (field instanceof model.LinkObject || field instanceof model.LinkArray) {
				field.bind(this.context);
			}
		});
		return a;
	}

	async insert(entity: T) {
		let stat: sql.Statement = new sql.Statement();
		stat.command = sql.types.Command.INSERT;
		stat.collection.value = this.mapping.name;

		Reflect.ownKeys(entity).forEach((key) => {
			let field = this.getKeyField(key);
			if (!field) return;

			// TODO: dynamic insert
			let col = new sql.Collection();
			col.value = field.colName;
			stat.columns.push(col);

			let v: sql.Expression = new sql.Expression('?');
			v.args.push(Reflect.get(entity, <string>key));
			stat.values.push(v);
		});

		let result = await this.context.execute(stat);
		let primaryFields = this.getPrimaryFields();

		if (primaryFields.length == 1) {
			let primaryField = primaryFields[0];
			let id = result.id || Reflect.get(entity, primaryField.fieldName);
			try {
				return await this.get(id);
			} catch (err) {
				return null;
			}
		} else if (primaryFields.length > 1) {
			let param = {};
			primaryFields.forEach(field => {
				Reflect.set(param, field.fieldName, Reflect.get(entity, field.fieldName));
			});
			return this.get(param);
		}
	}

	private getPrimaryFields() {
		return this.mapping.fields.filter(f => {
			return f.primaryKey;
		});
	}

	private whereExpr(entity: T) {
		let primaryFields = this.getPrimaryFields();
		if (!(primaryFields && primaryFields.length)) {
			throw new bean.SqlException('Primary Key fields not found');
		}

		let whereExpr = new sql.Expression();
		primaryFields.forEach(priField => {
			let w1 = new sql.Expression(priField.colName);
			let w2 = new sql.Expression('?');
			w2.args.push(Reflect.get(entity, priField.fieldName));
			whereExpr = whereExpr.add(new sql.Expression(null, sql.types.Operator.Equal, w1, w2));
		});
		return whereExpr;
	}

	async update(entity: T) {
		let stat = new sql.Statement();
		stat.command = sql.types.Command.UPDATE;
		stat.collection.value = this.mapping.name;

		let primaryFields = this.getPrimaryFields();
		Reflect.ownKeys(entity).forEach((key) => {
			let field = this.getKeyField(key);
			if (!field) return;

			let isPrimaryField = false;
			for (let f of primaryFields) {
				if (f.fieldName == field.fieldName) {
					isPrimaryField = true;
					break;
				}
			}
			// TODO: dynamic update
			if (!isPrimaryField) {
				let c1 = new sql.Expression(field.colName);
				let c2 = new sql.Expression('?');
				c2.args.push(Reflect.get(entity, <string>key));

				let c = new sql.Expression(null, sql.types.Operator.Equal, c1, c2);
				stat.columns.push(c);
			}
		});

		stat.where = this.whereExpr(entity);

		if (stat.columns.length > 0) {
			let result = await this.context.execute(stat);
			if (result.error) {
				throw result.error;
			} else if (primaryFields.length == 1) {
				let param = Reflect.get(entity, primaryFields[0].fieldName);
				return this.get(param);
			} else {
				let param = {};
				primaryFields.forEach(field => {
					Reflect.set(param, field.fieldName, Reflect.get(entity, field.fieldName));
				});
				return this.get(param);
			}
		} else {
			return entity;
		}
	}

	async insertOrUpdate(entity: T) {
		let primaryFields = this.getPrimaryFields();
		let param = {};
		primaryFields.forEach(field => {
			Reflect.set(param, field.fieldName, Reflect.get(entity, field.fieldName));
		});
		let obj = await this.get(param);

		if (obj) {
			return this.update(entity);
		} else {
			return this.insert(entity);
		}
	}

	async delete(entity: T) {
		let stat = new sql.Statement();
		stat.command = sql.types.Command.DELETE;
		stat.collection.value = this.mapping.name;

		stat.where = this.whereExpr(entity);
		await this.context.execute(stat);
	}

	async get(id: any) {
		if (id == null) throw new Error('Id parameter cannot be null');

		let primaryFields = this.getPrimaryFields();
		if (primaryFields.length == 0) {
			throw new Error('No Primary Field Found in Table: ' + this.mapping.name);
		} else if (primaryFields.length == 1) {
			if (typeof id === 'object') {
				let field = primaryFields[0];
				return this.where((a) => {
					// return (<sql.Field<any>>Reflect.get(a, field.fieldName)).eq(id[field.fieldName]);
					//TODO: implementation
					return null;
				}).unique();
			} else {
				let field = primaryFields[0];
				return this.where((a) => {
					// return (<sql.Field<any>>Reflect.get(a, field.fieldName)).eq(id);
					//TODO: implementation
					return null;
				}).unique();
			}
		} else if (primaryFields.length > 1 && typeof id === 'object') {
			let whereExpr = new sql.Expression();
			primaryFields.forEach(priField => {
				let w1 = new sql.Expression(priField.colName);
				let w2 = new sql.Expression('?');
				w2.args.push(id[priField.fieldName]);
				whereExpr = whereExpr.add(new sql.Expression(null, sql.types.Operator.Equal, w1, w2));
			});
			//TODO: fix where expr
			// return this.where(whereExpr).unique();
			return null;
		}
	}

	filterFields(props: string[]) {
		return this.mapping.fields.filter(f => props.includes(f.fieldName));
	}

	getColumnExprs(fields: Mapping.FieldMapping[], alias?: string) {
		let exprs = fields.map(field => {
			let val = alias ? alias + '.' + field.colName : field.colName;
			return new sql.Expression(val);
		});
		return exprs;
	}

	where(param?: types.IWhereFunc<sql.OperatorEntity<T>>, ...args: any[]): IQuerySet<T> {
		let q = new QuerySet(this);
		return q.where(param, args);
	}

	groupBy(func?: types.IArrFieldFunc<sql.OperatorEntity<T>>): IQuerySet<T> {
		let q = new QuerySet(this);
		return q.groupBy(func);
	}

	orderBy(func?: types.IArrFieldFunc<sql.OperatorEntity<T>>): IQuerySet<T> {
		let q = new QuerySet(this);
		return q.orderBy(func);
	}

	limit(size: number, index?: number) {
		let q = this.where();
		return q.limit(size, index);
	}

	list() {
		let q = this.where();
		return q.list();
	}

	select<U extends T>(TargetType: types.IEntityType<U>): Promise<U[]> {
		let q = new QuerySet(this);
		return q.select(TargetType);
	}

	selectPlain(keys: (keyof T)[]): Promise<types.SelectType<T>[]> {
		let q = new QuerySet(this);
		return q.selectPlain(keys);
	}

	join<A>(coll: IQuerySet<A>, param?: types.IJoinFunc<T, A> | sql.Expression, joinType?: sql.types.Join): IQuerySet<T & A> {
		let q = new QuerySet(this);
		return q.join(coll, param, joinType);
	}

}

export default DBSet;
