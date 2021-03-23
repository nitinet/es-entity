import * as fs from 'fs';
import * as path from 'path';
import * as Case from 'case';

import * as bean from '../bean';
import * as sql from '../sql';
import * as types from '../types';
import * as Mapping from '../Mapping';
import * as funcs from './funcs';
import IQuerySet from './IQuerySet';
import QuerySet from './QuerySet';

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
			let keys = Reflect.ownKeys(obj);
			keys.forEach(key => {
				let field = obj[key];

				// Bind Fields
				if (field instanceof sql.Field) {
					this.bindField(key.toString());
				}
			});
		}
	}

	private bindField(key: string) {
		let colName = Case.snake(key);
		let column = this.columns.filter(col => {
			return col.field == colName;
		})[0];

		try {
			if (column) {
				let field = new Mapping.FieldMapping({
					fieldName: key,
					colName: colName
				});
				if (column.type == bean.ColumnType.STRING) {
					field.type = 'string';
				} else if (column.type == bean.ColumnType.NUMBER) {
					field.type = 'number';
				} else if (column.type == bean.ColumnType.BOOLEAN) {
					field.type = 'boolean';
				} else if (column.type == bean.ColumnType.DATE) {
					field.type = 'date';
				} else if (column.type == bean.ColumnType.JSON) {
					field.type = 'jsonObject';
				} else {
					throw new Error('Type mismatch found for Column: ' + colName + ' in Table:' + this.mapping.name);
				}
				if (column.primaryKey) { field.primaryKey = true; }
				this.mapping.fields.push(field);
			} else {
				throw new Error('Column: ' + colName + ' not found in Table: ' + this.mapping.name);
			}
		} catch (err) {
			this.context.log(err);
		}
	}

	getEntityType() {
		return this.entityType;
	}

	getKeyField(key) {
		let field = this.mapping.fields.filter(a => {
			return a.fieldName == key;
		})[0];
		return field;
	}

	getEntity(alias?: string) {
		let a = new this.entityType();
		let keys = Reflect.ownKeys(a);
		keys.forEach(key => {
			let field = a[key];
			if (field instanceof sql.Field) {
				let fieldInfo = this.getKeyField(key);

				field._name = fieldInfo && fieldInfo.colName ? fieldInfo.colName : '';
				field._alias = alias;
				field._updated = false;
			} else if (field instanceof types.LinkObject || field instanceof types.LinkArray) {
				field.bind(this.context);
			}
		});
		return a;
	}

	getValue(obj, key: string) {
		return (<sql.Field<any>>obj[key]).get();
	}

	async insert(entity: T) {
		let stat: sql.Statement = new sql.Statement();
		stat.command = sql.Command.INSERT;
		stat.collection.value = this.mapping.name;

		Reflect.ownKeys(entity).forEach((key) => {
			let q = entity[key];
			if (q instanceof sql.Field && q._updated) {
				let field = this.getKeyField(key);

				let col = new sql.Collection();
				col.value = field.colName;
				stat.columns.push(col);

				let v: sql.Expression = new sql.Expression('?');
				v.args.push(this.getValue(entity, <string>key));
				stat.values.push(v);
			}
		});

		let result = await this.context.execute(stat);
		let primaryFields = this.getPrimaryFields();

		if (primaryFields.length == 1) {
			let primaryField = primaryFields[0];
			let id = result.id || this.getValue(entity, primaryField.fieldName);
			try {
				return await this.get(id);
			} catch (err) {
				return null;
			}
		} else if (primaryFields.length > 1) {
			let param = {};
			primaryFields.forEach(field => {
				param[field.fieldName] = this.getValue(entity, field.fieldName);
			});
			return await this.get(param);
		}
	}

	private getPrimaryFields() {
		let primaryFields = this.mapping.fields.filter(f => {
			return f.primaryKey;
		});
		return primaryFields;
	}

	private whereExpr(entity: T) {
		let primaryFields = this.getPrimaryFields();
		let whereExpr = new sql.Expression();
		primaryFields.forEach(priField => {
			let w1 = new sql.Expression(priField.colName);
			let w2 = new sql.Expression('?');
			w2.args.push(this.getValue(entity, priField.fieldName));
			whereExpr = whereExpr.add(new sql.Expression(null, sql.Operator.Equal, w1, w2));
		});
		return whereExpr;
	}

	async update(entity: T) {
		let stat = new sql.Statement();
		stat.command = sql.Command.UPDATE;
		stat.collection.value = this.mapping.name;

		let primaryFields = this.getPrimaryFields();
		Reflect.ownKeys(entity).forEach((key) => {
			let field = this.getKeyField(key);

			let q = entity[key];
			let isPrimaryField = false;
			for (let i = 0; i < primaryFields.length; i++) {
				const f = primaryFields[i];
				if (f.fieldName == field.fieldName) {
					isPrimaryField = true;
					break;
				}
			}
			if (q instanceof sql.Field && q._updated && isPrimaryField == false) {
				let c1 = new sql.Expression(field.colName);
				let c2 = new sql.Expression('?');
				c2.args.push(this.getValue(entity, <string>key));

				let c = new sql.Expression(null, sql.Operator.Equal, c1, c2);
				stat.columns.push(c);
			}
		});

		stat.where = this.whereExpr(entity);

		if (stat.columns.length > 0) {
			let result = await this.context.execute(stat);
			if (result.error) {
				throw result.error;
			} else if (primaryFields.length == 1) {
				let param = this.getValue(entity, primaryFields[0].fieldName);
				return await this.get(param);
			} else {
				let param = {};
				primaryFields.forEach(field => {
					param[field.fieldName] = this.getValue(entity, field.fieldName);
				});
				return await this.get(param);
			}
		} else {
			return entity;
		}
	}

	async insertOrUpdate(entity: T) {
		let primaryFields = this.getPrimaryFields();
		let param = {};
		primaryFields.forEach(field => {
			param[field.fieldName] = this.getValue(entity, field.fieldName);
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
		stat.command = sql.Command.DELETE;
		stat.collection.value = this.mapping.name;

		stat.where = this.whereExpr(entity);
		await this.context.execute(stat);
	}

	async get(id) {
		if (id == null) { throw new Error('Id parameter cannot be null'); }

		let primaryFields = this.getPrimaryFields();
		if (primaryFields.length == 0) {
			throw new Error('No Primary Field Found in Table: ' + this.mapping.name);
		} else if (primaryFields.length == 1) {
			let field = primaryFields[0];
			return await this.where((a) => {
				return (<sql.Field<any>>a[field.fieldName]).eq(id);
			}).unique();
		} else if (primaryFields.length > 1 && typeof id === 'object') {
			let whereExpr = new sql.Expression();
			primaryFields.forEach(priField => {
				let w1 = new sql.Expression(priField.colName);
				let w2 = new sql.Expression('?');
				w2.args.push(id[priField.fieldName]);
				whereExpr = whereExpr.add(new sql.Expression(null, sql.Operator.Equal, w1, w2));
			});
			return await this.where(whereExpr).unique();
		}
	}

	where(param?: funcs.IWhereFunc<T> | sql.Expression, ...args: any[]): IQuerySet<T> {
		let q = new QuerySet(this);

		let res: sql.Expression = null;
		if (param) {
			if (param instanceof Function) {
				let a = this.getEntity(q.alias);
				res = param(a, args);
			} else {
				res = param;
			}
		}
		if (res && res instanceof sql.Expression && res.exps.length > 0) {
			q.stat.where = q.stat.where.add(res);
		}
		return q;
	}

	groupBy(func?: funcs.IArrFieldFunc<T> | sql.Expression | sql.Expression[]) {
		let q = this.where();
		return q.groupBy(func);
	}

	orderBy(func?: funcs.IArrFieldFunc<T> | sql.Expression | sql.Expression[]) {
		let q = this.where();
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

	unique() {
		let q = this.where();
		return q.unique();
	}

	select<U>(param?: funcs.ISelectFunc<T, U>) {
		let q = this.where();
		return q.select<U>(param);
	}

	async mapData(input: bean.ResultSet): Promise<Array<T>> {
		let data = new Array<T>();
		await Promise.all(input.rows.map(async row => {
			let obj = this.getEntity();
			let keys = Reflect.ownKeys(obj);

			keys.filter(key => {
				let field = obj[key];
				return field instanceof sql.Field;
			}).forEach(key => {
				let fieldMapping = this.mapping.fields.find(f => {
					return f.fieldName == key;
				});
				if (fieldMapping) {
					let val = this.context.handler.mapData(row, fieldMapping.fieldName, fieldMapping.type);
					let field: sql.Field<any> = obj[key];
					field.set(val);
					field._updated = false;
				}
			});

			await Promise.all(keys.filter(key => {
				let field = obj[key];
				return (field instanceof types.LinkObject || field instanceof types.LinkArray);
			}).map(async key => {
				let field: types.LinkObject<any> | types.LinkArray<any> = obj[key];
				await field.apply(obj);
			}));

			data.push(obj);
		}));
		return data;
	}

	join<A>(coll: IQuerySet<A>, param?: funcs.IJoinFunc<T, A> | sql.Expression, joinType?: sql.Join) {
		let q = this.where();
		return q.join(coll, param, joinType);
	}

}

export default DBSet;
