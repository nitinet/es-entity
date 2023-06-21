import * as sql from '../sql/index.js';
import * as types from '../model/types.js';
import * as model from '../model/index.js';
import IQuerySet from './IQuerySet.js';
import QuerySet from './QuerySet.js';
import DBSet from './DBSet.js';

class TableSet<T extends Object> extends IQuerySet<T>{
	protected EntityType: types.IEntityType<T>;
	dbSet: DBSet<T>;

	constructor(EntityType: types.IEntityType<T>) {
		super();
		this.EntityType = EntityType;
		this.dbSet = new DBSet(EntityType);
	}

	getEntityType() {
		return this.EntityType;
	}

	getEntity() {
		let obj = new this.EntityType();
		let keys = Reflect.ownKeys(obj);
		keys.forEach(key => {
			let field = Reflect.get(obj, key);
			if (field instanceof model.LinkObject || field instanceof model.LinkArray) {
				field.bind(this.context, obj);
			}
		});
		return obj;
	}

	async insert(entity: T) {
		let stat: sql.Statement = new sql.Statement();
		stat.command = sql.types.Command.INSERT;
		stat.collection.value = this.dbSet.tableName;

		// Dynamic insert
		let fields = this.dbSet.filterFields(Reflect.ownKeys(entity));
		fields.forEach((field) => {
			let val = Reflect.get(entity, field.fieldName);
			if (val == null) return;

			let col = new sql.Collection();
			col.value = field.colName;
			stat.columns.push(col);

			let expr = new sql.Expression('?');
			expr.args.push(val);
			stat.values.push(expr);
		});

		let result = await this.context.execute(stat);
		let primaryFields = this.dbSet.getPrimaryFields();

		let finalObj: T | null = null;
		if (primaryFields.length == 1) {
			let primaryField = primaryFields[0];
			let id = result.id ?? Reflect.get(entity, primaryField.fieldName);
			finalObj = await this.get(id);
		} else {
			let idParams: any[] = [];
			primaryFields.forEach(field => {
				idParams.push(Reflect.get(entity, field.fieldName));
			});
			finalObj = await this.get(...idParams);
		}
		if (!finalObj) throw new Error('Insert Object Not Found');
		return finalObj;
	}

	async insertBulk(entities: T[]) {
		let queries = entities.map(ent => {
			let stat = new sql.Statement();
			stat.command = sql.types.Command.INSERT;
			stat.collection.value = this.dbSet.tableName;

			// Dynamic insert
			let fields = this.dbSet.filterFields(Reflect.ownKeys(ent));
			fields.forEach((field) => {
				let val: any = Reflect.get(ent, field.fieldName);
				if (val == null) return;

				let col = new sql.Collection();
				col.value = field.colName;
				stat.columns.push(col);

				let expr = new sql.Expression(val);
				stat.values.push(expr);
			});
			let query = stat.eval(this.context.handler);
			return query;
		});

		let bulkQuery = queries.join('; ');
		await this.context.execute(bulkQuery);
	}

	private whereExpr(entity: T) {
		let primaryFields = this.dbSet.getPrimaryFields();
		if (!(primaryFields?.length)) {
			throw new Error('Primary Key fields not found');
		}

		let eb = new model.WhereExprBuilder<T>(this.dbSet.fieldMap);
		let expr = new sql.Expression();
		primaryFields.forEach((pri, idx) => {
			let temp: any = Reflect.get(entity, pri.fieldName);
			expr = expr.add(eb.eq(<types.PropKeys<T>>pri.fieldName, temp));
		});
		return expr;
	}

	async update(entity: T, ...updatedKeys: (keyof T)[]) {
		let stat = new sql.Statement();
		stat.command = sql.types.Command.UPDATE;
		stat.collection.value = this.dbSet.tableName;

		let primaryFields = this.dbSet.getPrimaryFields();

		// Dynamic update
		let fields = this.dbSet.filterFields(Reflect.ownKeys(entity)).filter(field => !primaryFields.some(pri => pri.fieldName == field.fieldName));
		if (updatedKeys) fields = fields.filter(field => (<(string | symbol)[]>updatedKeys).includes(field.fieldName));

		fields.forEach((field) => {
			let c1 = new sql.Expression(field.colName);
			let c2 = new sql.Expression('?');
			let val = Reflect.get(entity, field.fieldName);
			c2.args.push(val);

			let expr = new sql.Expression(null, sql.types.Operator.Equal, c1, c2);
			stat.columns.push(expr);
		});

		stat.where = this.whereExpr(entity);

		if (stat.columns.length > 0) {
			let result = await this.context.execute(stat);
			if (result.error) {
				throw new Error(result.error);
			} else {
				let idParams: any[] = [];
				primaryFields.forEach(field => {
					idParams.push(Reflect.get(entity, field.fieldName));
				});
				let finalObj = await this.get(...idParams);
				if (!finalObj) throw new Error('Update Object Not Found');
				return finalObj;
			}
		} else {
			return entity;
		}
	}

	async updateBulk(entities: T[], ...updatedKeys: (keyof T)[]) {
		let primaryFields = this.dbSet.getPrimaryFields();

		let temp = new this.EntityType();
		let fields = this.dbSet.filterFields(Reflect.ownKeys(temp)).filter(field => !primaryFields.some(pri => pri.fieldName == field.fieldName));
		if (updatedKeys) fields = fields.filter(field => (<(string | symbol)[]>updatedKeys).includes(field.fieldName));

		let queries = entities.map(ent => {
			let stat = new sql.Statement();
			stat.command = sql.types.Command.UPDATE;
			stat.collection.value = this.dbSet.tableName;

			fields.forEach((field) => {
				let c1 = new sql.Expression(field.colName);
				let val: any = Reflect.get(ent, field.fieldName);
				let c2 = new sql.Expression(val);

				let expr = new sql.Expression(null, sql.types.Operator.Equal, c1, c2);
				stat.columns.push(expr);
			});

			stat.where = this.whereExpr(ent);

			let query = stat.eval(this.context.handler);
			return query;
		});

		let bulkQuery = queries.join('; ');
		await this.context.execute(bulkQuery);
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
			}).single()
		}
	}

	async getOrThrow(...idParams: any[]) {
		let val = await this.get(idParams);
		if (!val) throw new Error('Value Not Found');
		return val;
	}

	where(param: types.IWhereFunc<model.WhereExprBuilder<T>>, ...args: any[]) {
		let q = new QuerySet(this.context, this.dbSet);
		return q.where(param, args);
	}

	groupBy(func: types.IArrFieldFunc<model.GroupExprBuilder<T>>) {
		let q = new QuerySet(this.context, this.dbSet);
		return q.groupBy(func);
	}

	orderBy(func: types.IArrFieldFunc<model.OrderExprBuilder<T>>) {
		let q = new QuerySet(this.context, this.dbSet);
		return q.orderBy(func);
	}

	limit(size: number, index?: number) {
		let q = new QuerySet(this.context, this.dbSet);
		return q.limit(size, index);
	}

	list() {
		let q = new QuerySet(this.context, this.dbSet);
		return q.list();
	}

	select<U extends Object = types.SubEntityType<T>>(TargetType: types.IEntityType<U>) {
		let q = new QuerySet(this.context, this.dbSet);
		return q.select(TargetType);
	}

	selectPlain(keys: (keyof T)[]) {
		let q = new QuerySet(this.context, this.dbSet);
		return q.selectPlain(keys);
	}

	join<A extends Object>(coll: IQuerySet<A>, param: types.IJoinFunc<T, A>, joinType?: sql.types.Join) {
		let q = new QuerySet(this.context, this.dbSet);
		return q.join(coll, param, joinType);
	}
}

export default TableSet;
