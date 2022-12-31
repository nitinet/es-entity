import { Entity } from '../model/index.js';
import * as sql from '../sql/index.js';
import * as types from '../model/types.js';
import * as model from '../model/index.js';
import IQuerySet from './IQuerySet.js';
import QuerySet from './QuerySet.js';
import DBSet from './DBSet.js';

interface IOptions {
	tableName?: string;
}

class TableSet<T extends Entity> extends IQuerySet<T>{

	protected EntityType: types.IEntityType<T> = null;
	protected options: IOptions = null;
	dbSet: DBSet<T> = null;

	constructor(EntityType: types.IEntityType<T>, options?: IOptions) {
		super();

		this.EntityType = EntityType;
		this.options = options || {};

		this.dbSet = new DBSet(EntityType);
	}

	async bind() {
		await this.dbSet.bind(this.context, this.options.tableName);
	}

	getEntityType() {
		return this.EntityType;
	}

	getEntity() {
		let a = new this.EntityType();
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
		stat.collection.value = this.dbSet.tableName;

		// Dynamic insert
		let keys = Reflect.ownKeys(entity).filter(k => entity.getChangeProps().includes(k));
		keys.forEach((key) => {
			let field = this.dbSet.getField(key);
			if (!field) return;

			let col = new sql.Collection();
			col.value = field.colName;
			stat.columns.push(col);

			let v: sql.Expression = new sql.Expression('?');
			v.args.push(Reflect.get(entity, key));
			stat.values.push(v);
		});

		let result = await this.context.execute(stat);
		let primaryFields = this.dbSet.getPrimaryFields();

		try {
			if (primaryFields.length == 1) {
				let primaryField = primaryFields[0];
				let id = result.id ?? Reflect.get(entity, primaryField.fieldName);
				return await this.get(id);
			} else if (primaryFields.length > 1) {
				let idParams: any[] = [];
				primaryFields.forEach(field => {
					idParams.push(Reflect.get(entity, field.fieldName));
				});
				return this.get(...idParams);
			}
		} catch (err) {
			return null;
		}
	}

	private whereExpr(entity: T) {
		let primaryFields = this.dbSet.getPrimaryFields();
		if (!(primaryFields && primaryFields.length)) {
			throw new Error('Primary Key fields not found');
		}

		let a = new sql.OperatorEntity<T>(this.dbSet.fieldMap);
		let expr = new sql.Expression();
		primaryFields.forEach((pri, idx) => {
			let temp: any = Reflect.get(entity, pri.fieldName);
			expr = expr.add(a.eq(<types.PropKeys<T>>pri.fieldName, temp));
		});
		return expr;
	}

	async update(entity: T) {
		let stat = new sql.Statement();
		stat.command = sql.types.Command.UPDATE;
		stat.collection.value = this.dbSet.tableName;

		let primaryFields = this.dbSet.getPrimaryFields();

		// Dynamic update
		let keys = Reflect.ownKeys(entity).filter(k => entity.getChangeProps().includes(k));
		keys.forEach((key) => {
			let field = this.dbSet.getField(key);
			if (!field) return;

			if (!primaryFields.find(f => f.fieldName == key)?.primaryKey) {
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
			} else {
				let idParams: any[] = [];
				primaryFields.forEach(field => {
					idParams.push(Reflect.get(entity, field.fieldName));
				});
				return this.get(...idParams);
			}
		} else {
			return entity;
		}
	}

	async insertOrUpdate(entity: T) {
		let primaryFields = this.dbSet.getPrimaryFields();

		let idParams: any[] = [];
		primaryFields.forEach(field => {
			idParams.push(Reflect.get(entity, field.fieldName));
		});
		let obj = await this.get(...idParams);

		if (obj) {
			return this.update(entity);
		} else {
			return this.insert(entity);
		}
	}

	async delete(entity: T) {
		let stat = new sql.Statement();
		stat.command = sql.types.Command.DELETE;
		stat.collection.value = this.dbSet.tableName;

		stat.where = this.whereExpr(entity);
		await this.context.execute(stat);
	}

	async get(...idParams: any[]) {
		if (idParams == null) throw new Error('Id parameter cannot be null');

		let primaryFields = this.dbSet.getPrimaryFields();
		if (primaryFields.length == 0) {
			throw new Error(`No Primary Field Found in Table: ${this.dbSet.tableName}`);
		} else if (primaryFields.length != idParams.length) {
			throw new Error('Invalid Arguments Length');
		} else {
			return this.where(a => {
				let expr = new sql.Expression();
				primaryFields.forEach((pri, idx) => {
					expr = expr.add(a.eq(<types.PropKeys<T>>pri.fieldName, idParams[idx]));
				});
				return expr;
			}).unique()
		}
	}

	where(param: types.IWhereFunc<sql.OperatorEntity<T>>, ...args: any[]): IQuerySet<T> {
		let q = new QuerySet(this.context, this.dbSet, this.EntityType);
		return q.where(param, args);
	}

	groupBy(func: types.IArrFieldFunc<sql.OperatorEntity<T>>): IQuerySet<T> {
		let q = new QuerySet(this.context, this.dbSet, this.EntityType);
		return q.groupBy(func);
	}

	orderBy(func: types.IArrFieldFunc<sql.OperatorEntity<T>>): IQuerySet<T> {
		let q = new QuerySet(this.context, this.dbSet, this.EntityType);
		return q.orderBy(func);
	}

	limit(size: number, index?: number): IQuerySet<T> {
		let q = new QuerySet(this.context, this.dbSet, this.EntityType);
		return q.limit(size, index);
	}

	list(): Promise<T[]> {
		let q = new QuerySet(this.context, this.dbSet, this.EntityType);
		return q.list();
	}

	select<U extends model.Entity = types.SubEntityType<T>>(TargetType: types.IEntityType<U>): IQuerySet<U> {
		let q = new QuerySet(this.context, this.dbSet, TargetType);
		return q.select(TargetType);
	}

	selectPlain(keys: (keyof T)[]): Promise<types.SelectType<T>[]> {
		let q = new QuerySet(this.context, this.dbSet, this.EntityType);
		return q.selectPlain(keys);
	}

	join<A extends model.Entity>(coll: IQuerySet<A>, param: types.IJoinFunc<T, A>, joinType?: sql.types.Join): IQuerySet<T & A> {
		let q = new QuerySet(this.context, this.dbSet, this.EntityType);
		return q.join(coll, param, joinType);
	}
}

export default TableSet;
