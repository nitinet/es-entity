/// <reference path="/usr/local/lib/typings/globals/node/index.d.ts" />

import fs = require("fs");
import path = require("path");
import Case = require("case");

import Context from "./Context";
import Entity, {IEntityType, Field, StringField, NumberField, BooleanField, DateField} from "./Entity";
import * as Mapping from "./Mapping";
import * as Query from "./Query";
import * as Handler from "./Handler";

interface whereFunc<T> {
	(source: T, ...args: any[]): Query.SqlExpression;
}

interface arrFieldFunc<T> {
	(source: T): Query.SqlExpression[];
}

interface Queryable<T> {
	// Selection Functions
	list(): Promise<Array<T>>;
	unique(): Promise<T>;

	// Conditional Functions
	where(func?: whereFunc<T> | Query.SqlExpression, ...args: any[]): Queryable<T>;
	groupBy(func?: arrFieldFunc<T> | Query.SqlExpression[]): Queryable<T>;
	orderBy(func?: arrFieldFunc<T> | Query.SqlExpression[]): Queryable<T>;
}

class DBSet<T> implements Queryable<T> {
	entityType: IEntityType<T>;
	context: Context;
	mapping: Mapping.EntityMapping = new Mapping.EntityMapping();

	constructor(entityType: IEntityType<T>) {
		this.entityType = entityType;
	}

	async bind(context: Context): Promise<void> {
		this.context = context;
		let entityName: string = this.entityType.name;
		let filePath: string = null;
		if (this.context.entityPath) {
			filePath = path.join(this.context.entityPath, entityName + ".json");
		}
		if (filePath && fs.statSync(filePath).isFile()) {
			let data = fs.readFileSync(filePath, "utf-8");
			this.mapping = new Mapping.EntityMapping(JSON.parse(data));
		} else {
			this.mapping = new Mapping.EntityMapping();
			this.mapping.entityName = entityName;
			this.mapping.name = Case.snake(entityName);

			// get info from describe db
			let columns = await this.context.handler.getTableInfo(this.mapping.name);

			let a = new this.entityType();
			let keys = Reflect.ownKeys(a);
			for (let i = 0; i < keys.length; i++) {
				let key = keys[i];
				let f = a[key];
				if (f instanceof Field) {
					let name = Case.snake(key);
					let column: Handler.ColumnInfo = null;
					for (var j = 0; j < columns.length; j++) {
						var c = columns[j];
						if (c.field == name) {
							column = c;
						}
					}
					if (column) {
						let type = new String();
						if (f instanceof StringField && column.type == "string") {
							type = "string";
						} else if (f instanceof NumberField && column.type == "number") {
							type = "number";
						} else if (f instanceof BooleanField && column.type == "boolean") {
							type = "boolean";
						} else if (f instanceof DateField && column.type == "date") {
							type = "date";
						} else {
							throw "Tyep mismatch found for column " + name;
						}
						this.mapping.fields.set(<string>key, new Mapping.FieldMapping({ name: name, type: type }));
						if (column.primaryKey) {
							this.mapping.primaryKey = <string>key;
							this.mapping.primaryKeyField = this.mapping.fields.get(<string>key);
						}
					} else {
						throw "Column " + name + " not found";
					}
				}
			}
		}
	}

	getEntity(alias?: string): T {
		let a = new this.entityType();
		let name = null;
		Reflect.ownKeys(a).forEach((key) => {
			let q: any = a[key];
			if (q instanceof Field) {
				let field = this.mapping.fields.get(<string>key);
				name = field.name;
				(<Query.Column>q)._name = name;
				(<Query.Column>q)._alias = alias;
			}
		});
		return a;
	}

	isUpdated(obj: any, key: string): boolean {
		return (<Query.Column>obj[key])._updated ? true : false;
	}

	setValue(obj: any, key: string, value: any): void {
		(<Field>obj[key]).set(value);
	}

	getValue(obj: any, key: string): any {
		return (<Query.Column>obj[key]).get();
	}

	executeStatement(stat: Query.SqlStatement): Promise<Handler.ResultSet> {
		return this.context.execute(stat);
	}

	async insert(entity: T): Promise<T> {
		let stat: Query.SqlStatement = new Query.SqlStatement();
		stat.command = "insert";
		stat.collection.value = this.mapping.name;

		await Reflect.ownKeys(entity).forEach((key) => {
			let q: any = entity[key];
			if (q instanceof Field) {
				let f = this.mapping.fields.get(<string>key);
				let c: Query.SqlCollection = new Query.SqlCollection();
				c.value = f.name;
				stat.columns.push(c);

				let v: Query.SqlExpression = new Query.SqlExpression("?");
				v.args.push(this.getValue(entity, <string>key));
				stat.values.push(v);
			}
		});

		let result = await this.context.execute(stat);
		return await this.get(result.id);
	}

	async update(entity: T): Promise<T> {
		let stat: Query.SqlStatement = new Query.SqlStatement();
		stat.command = "update";
		stat.collection.value = this.mapping.name;

		await Reflect.ownKeys(entity).forEach((key) => {
			let f = this.mapping.fields.get(<string>key);
			if (this.isUpdated(entity, <string>key) && f != this.mapping.primaryKeyField) {
				let c1: Query.SqlExpression = new Query.SqlExpression(f.name);
				let c2: Query.SqlExpression = new Query.SqlExpression("?");
				c2.args.push(this.getValue(entity, <string>key));

				let c: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.Equal, c1, c2);
				stat.columns.push(c);
			}
		});

		let w1: Query.SqlExpression = new Query.SqlExpression(this.mapping.primaryKeyField.name);
		let w2: Query.SqlExpression = new Query.SqlExpression("?");
		w2.args.push(this.getValue(entity, this.mapping.primaryKey));
		stat.where = new Query.SqlExpression(null, Query.Operator.Equal, w1, w2);

		if (stat.columns.length > 0) {
			let result = await this.context.execute(stat);
			if (result.error)
				throw result.error;
			else
				return await this.get(this.getValue(entity, this.mapping.primaryKey));
		} else {
			return null;
		}
	}

	insertOrUpdate(entity: T): Promise<T> {
		if (this.getValue(entity, this.mapping.primaryKey)) {
			return this.update(entity);
		} else {
			return this.insert(entity);
		}
	}

	async delete(entity: T): Promise<void> {
		let stat: Query.SqlStatement = new Query.SqlStatement();
		stat.command = "delete";
		stat.collection.value = this.mapping.name;

		let w1: Query.SqlExpression = new Query.SqlExpression(this.mapping.primaryKeyField.name);
		let w2: Query.SqlExpression = new Query.SqlExpression("?");
		w2.args.push(this.getValue(entity, this.mapping.primaryKey));
		stat.where = new Query.SqlExpression(null, Query.Operator.Equal, w1, w2);
		await this.context.execute(stat);
	}

	async get(id: any): Promise<T> {
		if (!this.mapping.primaryKeyField)
			throw "No Primary Field Found";

		if (!id)
			throw "Id parameter cannot be null";

		let fieldName = this.mapping.primaryKey;
		return await this.where((a: T, id) => {
			return (<Query.Column>a[fieldName]).eq(id);
		}, id).unique();
	}

	where(param?: whereFunc<T> | Query.SqlExpression, ...args: any[]): Queryable<T> {
		let stat: Query.SqlStatement = new Query.SqlStatement();
		stat.command = "select";

		let alias = this.mapping.name.charAt(0);
		stat.collection.value = this.mapping.name;
		stat.collection.alias = alias;

		let a = this.getEntity(stat.collection.alias);
		let res: any = null;
		if (param) {
			if (param instanceof Function) {
				res = param(a, args);
			} else if (param instanceof Query.SqlExpression) {
				res = param;
			}
		}
		if (res instanceof Query.SqlExpression) {
			stat.where = res;
		}
		let s: SimpleQueryable<T> = new SimpleQueryable(stat, this);
		return s;
	}

	groupBy(func?: arrFieldFunc<T> | Query.SqlExpression[]): Queryable<T> {
		let q = this.where();
		return q.groupBy(func);
	}

	orderBy(func?: arrFieldFunc<T> | Query.SqlExpression[]): Queryable<T> {
		let q = this.where();
		return q.orderBy(func);
		}

	list(): Promise<Array<any>> {
				let q = this.where();
				return q.list();
	}

	unique(): Promise<T> {
				let q = this.where();
				return q.unique();
	}

}

/**
 * SimpleQueryable
 */
class SimpleQueryable<T> implements Queryable<T> {
	dbSet: DBSet<T> = null;
	stat: Query.SqlStatement = null;

	constructor(stat: Query.SqlStatement, dbSet: DBSet<T>) {
		this.stat = stat;
		this.dbSet = dbSet;
	}

	// Selection Functions
	async list(): Promise<Array<any>> {
		let alias: string = this.stat.collection.alias;

		this.dbSet.mapping.fields.forEach((field, fieldName) => {
			let c: Query.SqlCollection = new Query.SqlCollection();
			c.colAlias = alias;
			c.value = field.name;
			c.alias = fieldName;
			this.stat.columns.push(c);
		});

		let result = await this.dbSet.executeStatement(this.stat);
		let data: Array<T> = new Array();
		for (let j = 0; j < result.rows.length; j++) {
			let row = result.rows[j];
			let a = this.dbSet.getEntity();
			await this.dbSet.mapping.fields.forEach((field, fieldName) => {
				this.dbSet.setValue(a, fieldName, row[fieldName]);
			});
			data.push(a);
		}
		return data;
	}

	// Selection Functions
	async select(func?: arrFieldFunc<T>): Promise<Array<any>> {
		let cols: Query.SqlExpression[] = new Array();
		if (func) {
			let a = this.dbSet.getEntity(this.stat.collection.alias);
			let temp = func(a);
			for (var i = 0; i < temp.length; i++) {
				var e = temp[i];
				cols.push(e._createExpr());
			}
		} else {
			let alias: string = this.stat.collection.alias;
			await this.dbSet.mapping.fields.forEach((field, fieldName) => {
				let c: Query.SqlCollection = new Query.SqlCollection();
				c.colAlias = alias;
				c.value = field.name;
				c.alias = fieldName;
				this.stat.columns.push(c);
			});
		}

		let result = await this.dbSet.executeStatement(this.stat);
		if (result.rows.length == 0)
			throw "No Result Found";
		else {
			let data: Array<T> = new Array();
			for (let j = 0; j < result.rows.length; j++) {
				let row = result.rows[j];
				let a = this.dbSet.getEntity();
				await this.dbSet.mapping.fields.forEach((field, fieldName) => {
					this.dbSet.setValue(a, fieldName, row[fieldName]);
				});
				data.push(a);
			}
			return data;
		}
	}

	async unique(): Promise<T> {
		let l = await this.list();
		if (l.length > 1) {
			throw "More than one row found";
		} else {
			return l[0];
		}
	}

	// Conditional Functions
	where(param?: whereFunc<T> | Query.SqlExpression, ...args: any[]): Queryable<T> {
		let a = this.dbSet.getEntity(this.stat.collection.alias);
		let res: any = null;
		if (param) {
			if (param instanceof Function) {
				res = param(a, args);
			} else if (param instanceof Query.SqlExpression) {
				res = param;
			}
		}
		if (res instanceof Query.SqlExpression) {
			this.stat.where.add(res);
		}
		let s: SimpleQueryable<T> = new SimpleQueryable(this.stat, this.dbSet);
		return s;
	}

	groupBy(param?: arrFieldFunc<T> | Query.SqlExpression[]): Queryable<T> {
		let a = this.dbSet.getEntity(this.stat.collection.alias);
		let res: any = null;
		if (param) {
						if (param instanceof Function) {
				res = param(a);
						} else if (param instanceof Array) {
				res = param;
						}
		}
		if (res instanceof Array) {
						for (let i = 0; i < res.length; i++) {
				if (res[i] instanceof Query.SqlExpression) {
					this.stat.groupBy.push((<Query.SqlExpression>res[i])._createExpr());
				}
						}
		}
		let s: SimpleQueryable<T> = new SimpleQueryable(this.stat, this.dbSet);
		return s;
	}

	orderBy(param?: arrFieldFunc<T> | Query.SqlExpression[]): Queryable<T> {
		let a = this.dbSet.getEntity(this.stat.collection.alias);
		let res: any = null;
		if (param) {
			if (param instanceof Function) {
				res = param(a);
			} else if (param instanceof Array) {
				res = param;
			}
		}
		if (res instanceof Array) {
			for (let i = 0; i < res.length; i++) {
				if (res[i] instanceof Query.SqlExpression) {
					this.stat.orderBy.push((<Query.SqlExpression>res[i])._createExpr());
				}
			}
		}
		let s: SimpleQueryable<T> = new SimpleQueryable(this.stat, this.dbSet);
		return s;
		}

}

export {DBSet};
export default Queryable;