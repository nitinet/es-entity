import * as fs from "fs";
import * as path from "path";
import * as Case from "case";

import Context from "./Context";
import * as Type from "./Type";
import * as Mapping from "./Mapping";
import * as Query from "./Query";
import * as Handler from "./Handler";

interface whereFunc<T> {
	(source: T, ...args: any[]): Query.SqlExpression;
}

interface arrFieldFunc<T> {
	(source: T): Query.SqlExpression | Query.SqlExpression[];
}

export default interface Queryable<T> {
	getEntity(alias?: string): T;
	insert(entity: T): Promise<T>;
	update(entity: T): Promise<T>;
	insertOrUpdate(entity: T);
	delete(entity: T): Promise<void>;

	// Selection Functions
	list(): Promise<Array<T>>;
	unique(): Promise<T>;

	// Conditional Functions
	where(func?: whereFunc<T> | Query.SqlExpression, ...args: any[]): Queryable<T>;
	groupBy(func?: arrFieldFunc<T> | Query.SqlExpression | Query.SqlExpression[]): Queryable<T>;
	orderBy(func?: arrFieldFunc<T> | Query.SqlExpression | Query.SqlExpression[]): Queryable<T>;
	limit(size: number, index?: number): Queryable<T>;

	mapData(input: Handler.ResultSet): Promise<Array<T>>;
}

export class DBSet<T extends Object> implements Queryable<T> {
	entityType: Type.IEntityType<T>;
	entityName: string = null;
	entityPath: string = null;
	context: Context;
	mapping: Mapping.EntityMapping = new Mapping.EntityMapping();

	constructor(entityType: Type.IEntityType<T>, entityName?: string, entityPath?: string) {
		this.entityType = entityType;
		this.entityName = entityName ? entityName : this.entityType.name;
		this.entityPath = entityPath;
	}

	bind(context: Context) {
		this.context = context;
		let filePath: string = null;
		if (this.entityPath) {
			filePath = this.entityPath;
		} else if (this.context.entityPath) {
			filePath = path.join(this.context.entityPath, this.entityName + ".json");
		}
		if (filePath && fs.statSync(filePath).isFile()) {
			let data = fs.readFileSync(filePath, "utf-8");
			this.mapping = new Mapping.EntityMapping(JSON.parse(data));
		} else {
			this.mapping = new Mapping.EntityMapping();
			this.mapping.entityName = this.entityName;
			this.mapping.name = Case.snake(this.entityName);

			// get info from describe db
			let columns = this.context.handler.getTableInfo(this.mapping.name);

			let a = new this.entityType();
			let keys = Reflect.ownKeys(a);
			for (let i = 0; i < keys.length; i++) {
				let key = keys[i];
				let f = a[key];
				if (f instanceof Type.Field) {
					let name = Case.snake(key.toString());
					let column: Handler.ColumnInfo = null;
					for (let j = 0; j < columns.length; j++) {
						let c = columns[j];
						if (c.field == name) {
							column = c;
							break;
						}
					}
					if (column) {
						let type = new String();
						if (f instanceof Type.String && column.type == "string") {
							type = "string";
						} else if (f instanceof Type.Number && column.type == "number") {
							type = "number";
						} else if (f instanceof Type.Boolean && column.type == "boolean") {
							type = "boolean";
						} else if (f instanceof Type.Date && column.type == "date") {
							type = "date";
						} else if (f instanceof Type.Object && column.type == "string") {
							type = "object";
						} else {
							throw new Error("Type mismatch found for Column: " + name + " in Table:" + this.mapping.name);
						}
						this.mapping.fields.set(<string>key, new Mapping.FieldMapping({
							name: name,
							type: type
						}));
						if (column.primaryKey) {
							this.mapping.primaryKey = <string>key;
							this.mapping.primaryKeyField = this.mapping.fields.get(<string>key);
						}
					} else {
						throw new Error("Column: " + name + " not found in Table: " + this.mapping.name);
					}
				}
			}
		}
	}

	getEntity(alias?: string) {
		let a = new this.entityType();
		let name = null;
		let keys = Reflect.ownKeys(a);
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			let q = a[key];
			if (q instanceof Type.Field) {
				let field = this.mapping.fields.get(<string>key);
				name = field.name;
				(<Query.Column>q)._name = name;
				(<Query.Column>q)._alias = alias;
			}
		}
		return a;
	}

	isUpdated(obj, key: string): boolean {
		return (<Query.Column>obj[key])._updated ? true : false;
	}

	setValue(obj, key: string, value): void {
		if (value != null) {
			(<Type.Field<any>>obj[key]).set(value);
			(<Type.Field<any>>obj[key])._updated = false;
		}
	}

	getValue(obj, key: string) {
		return (<Type.Field<any>>obj[key])._value;
	}

	async executeStatement(stat: Query.SqlStatement): Promise<Handler.ResultSet> {
		return await this.context.execute(stat);
	}

	async insert(entity: T) {
		let stat: Query.SqlStatement = new Query.SqlStatement();
		stat.command = "insert";
		stat.collection.value = this.mapping.name;

		await Reflect.ownKeys(entity).forEach((key) => {
			let q = entity[key];
			if (q instanceof Type.Field && this.isUpdated(entity, <string>key)) {
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
		if (!result.id) {
			result.id = this.getValue(entity, this.mapping.primaryKey);
		}
		return await this.get(result.id);
	}

	async update(entity: T) {
		let stat = new Query.SqlStatement();
		stat.command = "update";
		stat.collection.value = this.mapping.name;

		await Reflect.ownKeys(entity).forEach((key) => {
			let f = this.mapping.fields.get(<string>key);
			let q = entity[key];
			if (q instanceof Type.Field && this.isUpdated(entity, <string>key) && f != this.mapping.primaryKeyField) {
				let c1 = new Query.SqlExpression(f.name);
				let c2 = new Query.SqlExpression("?");
				c2.args.push(this.getValue(entity, <string>key));

				let c = new Query.SqlExpression(null, Query.Operator.Equal, c1, c2);
				stat.columns.push(c);
			}
		});

		let w1 = new Query.SqlExpression(this.mapping.primaryKeyField.name);
		let w2 = new Query.SqlExpression("?");
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

	insertOrUpdate(entity: T) {
		if (this.getValue(entity, this.mapping.primaryKey)) {
			return this.update(entity);
		} else {
			return this.insert(entity);
		}
	}

	async delete(entity: T) {
		let stat = new Query.SqlStatement();
		stat.command = "delete";
		stat.collection.value = this.mapping.name;

		let w1 = new Query.SqlExpression(this.mapping.primaryKeyField.name);
		let w2 = new Query.SqlExpression("?");
		w2.args.push(this.getValue(entity, this.mapping.primaryKey));
		stat.where = new Query.SqlExpression(null, Query.Operator.Equal, w1, w2);
		await this.context.execute(stat);
	}

	async get(id): Promise<T> {
		if (!this.mapping.primaryKeyField)
			throw new Error("No Primary Field Found in Table: " + this.mapping.name);

		if (!id)
			throw new Error("Id parameter cannot be null");

		let fieldName = this.mapping.primaryKey;
		return await this.where((a: T, id) => {
			return (<Query.Column>a[fieldName]).eq(id);
		}, id).unique();
	}

	where(param?: whereFunc<T> | Query.SqlExpression, ...args: any[]): Queryable<T> {
		let stat = new Query.SqlStatement();
		stat.command = "select";

		let alias = this.mapping.name.charAt(0);
		stat.collection.value = this.mapping.name;
		stat.collection.alias = alias;

		let res = null;
		if (param instanceof Function) {
			let a = this.getEntity(stat.collection.alias);
			res = param(a, args);
		} else {
			res = param;
		}
		if (res instanceof Query.SqlExpression && res.exps.length > 0) {
			stat.where = res;
		}
		let s = new SimpleQueryable(stat, this);
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

	limit(size: number, index?: number): Queryable<T> {
		let q = this.where();
		return q.limit(size, index);
	}

	list(): Promise<Array<T>> {
		let q = this.where();
		return q.list();
	}

	unique(): Promise<T> {
		let q = this.where();
		return q.unique();
	}

	mapData(input: Handler.ResultSet): Promise<Array<T>> {
		let q = this.where();
		return q.mapData(input);
	}

}

/**
 * SimpleQueryable
 */
class SimpleQueryable<T extends Object> implements Queryable<T> {
	dbSet: DBSet<T> = null;
	stat: Query.SqlStatement = null;

	constructor(stat: Query.SqlStatement, dbSet: DBSet<T>) {
		this.stat = stat;
		this.dbSet = dbSet;
	}

	getEntity(alias?: string) {
		return this.dbSet.getEntity(alias);
	}

	insert(entity: T) {
		return this.dbSet.insert(entity);
	}

	update(entity: T) {
		return this.dbSet.update(entity);
	}

	insertOrUpdate(entity: T) {
		return this.dbSet.insertOrUpdate(entity);
	}

	delete(entity: T) {
		return this.dbSet.delete(entity);
	}

	// Selection Functions
	async list() {
		let alias: string = this.stat.collection.alias;

		this.dbSet.mapping.fields.forEach((field, fieldName) => {
			let c: Query.SqlCollection = new Query.SqlCollection();
			c.colAlias = alias;
			c.value = field.name;
			c.alias = fieldName;
			this.stat.columns.push(c);
		});

		let result = await this.dbSet.executeStatement(this.stat);
		return this.mapData(result);
	}

	// Selection Functions
	async select(func?: arrFieldFunc<T>) {
		let cols: Query.SqlExpression[] = new Array();
		if (func) {
			let a = this.dbSet.getEntity(this.stat.collection.alias);
			let temp = func(a);
			if (temp instanceof Array) {
				for (let i = 0; i < temp.length; i++) {
					cols.push(temp[i]._createExpr());
				}
			} else {
				cols.push(temp._createExpr());
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
			throw new Error("No Result Found");
		else {
			return this.mapData(result);
		}
	}

	async unique() {
		let l = await this.list();
		if (l.length > 1) {
			throw new Error("More than one row found in unique call");
		} else {
			return l[0];
		}
	}

	// Conditional Functions
	where(param?: whereFunc<T> | Query.SqlExpression, ...args: any[]): Queryable<T> {
		let res = null;
		if (param instanceof Function) {
			let a = this.dbSet.getEntity(this.stat.collection.alias);
			res = param(a, args);
		} else {
			res = param;
		}
		if (res instanceof Query.SqlExpression && res.exps.length > 0) {
			this.stat.where = this.stat.where.add(res);
		}
		let s: SimpleQueryable<T> = new SimpleQueryable(this.stat, this.dbSet);
		return s;
	}

	groupBy(param?: arrFieldFunc<T> | Query.SqlExpression[]): Queryable<T> {
		let a = this.dbSet.getEntity(this.stat.collection.alias);
		let res = null;
		if (param instanceof Function) {
			res = param(a);
		} else if (param instanceof Array) {
			res = param;
		}
		if (res instanceof Array) {
			for (let i = 0; i < res.length; i++) {
				if (res[i] instanceof Query.SqlExpression && res[i].exps.length > 0) {
					this.stat.groupBy.push((<Query.SqlExpression>res[i])._createExpr());
				}
			}
		} else {
			if (res instanceof Query.SqlExpression && res.exps.length > 0) {
				this.stat.groupBy.push(res._createExpr());
			}
		}
		let s: SimpleQueryable<T> = new SimpleQueryable(this.stat, this.dbSet);
		return s;
	}

	orderBy(param?: arrFieldFunc<T> | Query.SqlExpression[]): Queryable<T> {
		let a = this.dbSet.getEntity(this.stat.collection.alias);
		let res = null;
		if (param instanceof Function) {
			res = param(a);
		} else if (param instanceof Array) {
			res = param;
		}
		if (res instanceof Array) {
			for (let i = 0; i < res.length; i++) {
				if (res[i] instanceof Query.SqlExpression && res[i].exps.length > 0) {
					this.stat.orderBy.push((<Query.SqlExpression>res[i])._createExpr());
				}
			}
		} else {
			if (res instanceof Query.SqlExpression && res.exps.length > 0) {
				this.stat.orderBy.push(res._createExpr());
			}
		}
		let s: SimpleQueryable<T> = new SimpleQueryable(this.stat, this.dbSet);
		return s;
	}

	limit(size: number, index?: number): Queryable<T> {
		this.stat.limit = new Query.SqlExpression(null, Query.Operator.Limit);
		if (index) {
			this.stat.limit.exps.push(new Query.SqlExpression(index.toString()));
		}
		this.stat.limit.exps.push(new Query.SqlExpression(size.toString()));
		let s: SimpleQueryable<T> = new SimpleQueryable(this.stat, this.dbSet);
		return s;
	}

	async	mapData(input: Handler.ResultSet): Promise<Array<T>> {
		let data: Array<T> = new Array();
		for (let j = 0; j < input.rows.length; j++) {
			let row = input.rows[j];
			let a = this.dbSet.getEntity();
			await this.dbSet.mapping.fields.forEach((field, fieldName) => {
				this.dbSet.setValue(a, fieldName, row[fieldName]);
			});
			data.push(a);
		}
		return data;
	}

}
