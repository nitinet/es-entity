import * as decoratorKeys from '../decorators/Constants.js';
import * as model from '../model/index.js';
import * as types from '../model/types.js';
import * as sql from '../sql/index.js';
import DBSet from './DBSet.js';
import IQuerySet from './IQuerySet.js';
import QuerySet from './QuerySet.js';
import SelectQuerySet from './SelectQuerySet.js';

class TableSet<T extends Object> extends IQuerySet<T>{
	protected EntityType: types.IEntityType<T>;
	dbSet: DBSet;

	private primaryFields: model.FieldMapping[] = [];

	constructor(EntityType: types.IEntityType<T>) {
		super();
		this.EntityType = EntityType;
		this.dbSet = this.createDbSet();
	}

	getEntityType() {
		return this.EntityType;
	}

	// getEntity() {
	// 	let obj = new this.EntityType();

	// 	let keys: string[] = Reflect.getMetadata(TABLE_COLUMN_KEYS, this.EntityType.prototype);
	// 	keys.forEach(key => {
	// 		let field = Reflect.get(obj, key);
	// 		if (field instanceof model.LinkObject || field instanceof model.LinkArray) {
	// 			field.bind(this.context, obj);
	// 		}
	// 	});
	// 	return obj;
	// }

	private createDbSet() {
		let dbSet = new DBSet();
		let tableName: string | null = Reflect.getMetadata(decoratorKeys.TABLE_KEY, this.EntityType);
		if (!tableName) throw new Error('Table Name Not Found');
		dbSet.tableName = tableName;

		let keys: string[] = Reflect.getMetadata(decoratorKeys.TABLE_COLUMN_KEYS, this.EntityType.prototype);

		// Bind Fields
		keys.forEach(key => this.bindDbSetField(dbSet, key));
		return dbSet;
	}

	private bindDbSetField(dbSet: DBSet, key: string) {
		let columnName: string | null = Reflect.getMetadata(decoratorKeys.COLUMN_KEY, this.EntityType.prototype, key);
		if (columnName) {
			let columnType = Reflect.getMetadata('design:type', this.EntityType.prototype, key);
			let primaryKey = Reflect.getMetadata(decoratorKeys.ID_KEY, this.EntityType.prototype, key) === true;

			let fieldMapping = new model.FieldMapping(key, columnName, columnType, primaryKey);
			dbSet.fieldMap.set(key, fieldMapping);

			if (primaryKey) this.primaryFields.push(fieldMapping);
		}
	}

	async insert(entity: T) {
		let stat: sql.Statement = new sql.Statement();
		stat.command = sql.types.Command.INSERT;

		stat.collection.value = this.dbSet.tableName;

		// Dynamic insert
		let keys: string[] = Reflect.getMetadata(decoratorKeys.TABLE_COLUMN_KEYS, this.EntityType.prototype);
		let fields = this.dbSet.filterFields(keys);
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

		let finalObj: T | null = null;
		if (this.primaryFields.length == 1) {
			let primaryField = this.primaryFields[0];
			let id = result.id ?? Reflect.get(entity, primaryField.fieldName);
			finalObj = await this.get(id);
		} else {
			let idParams: any[] = [];
			this.primaryFields.forEach(field => {
				idParams.push(Reflect.get(entity, field.fieldName));
			});
			finalObj = await this.get(...idParams);
		}
		if (!finalObj) throw new Error('Insert Object Not Found');
		return finalObj;
	}

	async insertBulk(entities: T[]) {
		let stmts = entities.map(entity => {
			let stat: sql.Statement = new sql.Statement();
			stat.command = sql.types.Command.INSERT;

			stat.collection.value = this.dbSet.tableName;

			// Dynamic insert
			let keys: string[] = Reflect.getMetadata(decoratorKeys.TABLE_COLUMN_KEYS, this.EntityType.prototype);
			let fields = this.dbSet.filterFields(keys);
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
			return stat;
		});

		await this.context.handler.run(stmts);
	}

	private whereExpr(entity: T) {
		if (!(this.primaryFields?.length)) {
			throw new Error('Primary Key fields not found');
		}

		let eb = new model.WhereExprBuilder<T>(this.dbSet.fieldMap);
		let expr = new sql.Expression();
		this.primaryFields.forEach((pri, idx) => {
			let temp: any = Reflect.get(entity, pri.fieldName);
			expr = expr.add(eb.eq(<types.KeyOf<T>>pri.fieldName, temp));
		});
		return expr;
	}

	async update(entity: T, ...updatedKeys: (keyof T)[]) {
		let stat = new sql.Statement();
		stat.command = sql.types.Command.UPDATE;

		stat.collection.value = this.dbSet.tableName;

		// Dynamic update
		let keys: string[] = Reflect.getMetadata(decoratorKeys.TABLE_COLUMN_KEYS, this.EntityType.prototype);
		let fields = this.dbSet.filterFields(keys).filter(field => !this.primaryFields.some(pri => pri.fieldName == field.fieldName));
		if (updatedKeys) fields = fields.filter(field => (<(string | symbol)[]>updatedKeys).includes(field.fieldName));
		if (fields.length == 0) throw new Error('Update Fields Empty');

		fields.forEach((field) => {
			let c1 = new sql.Expression(field.colName);
			let c2 = new sql.Expression('?');
			let val = Reflect.get(entity, field.fieldName);
			c2.args.push(val);

			let expr = new sql.Expression(null, sql.types.Operator.Equal, c1, c2);
			stat.columns.push(expr);
		});

		stat.where = this.whereExpr(entity);

		let result = await this.context.execute(stat);
		if (result.error) {
			throw new Error(result.error);
		} else {
			let idParams: any[] = [];
			this.primaryFields.forEach(field => {
				idParams.push(Reflect.get(entity, field.fieldName));
			});
			let finalObj = await this.get(...idParams);
			if (!finalObj) throw new Error('Update Object Not Found');
			return finalObj;
		}
	}

	async updateBulk(entities: T[], ...updatedKeys: (keyof T)[]) {
		let keys: string[] = Reflect.getMetadata(decoratorKeys.TABLE_COLUMN_KEYS, this.EntityType.prototype);
		let fields = this.dbSet.filterFields(keys).filter(field => !this.primaryFields.some(pri => pri.fieldName == field.fieldName));
		if (updatedKeys) fields = fields.filter(field => (<(string | symbol)[]>updatedKeys).includes(field.fieldName));

		let stmts = entities.map(entity => {
			let stat = new sql.Statement();
			stat.command = sql.types.Command.UPDATE;
			stat.collection.value = this.dbSet.tableName;

			fields.forEach((field) => {
				let c1 = new sql.Expression(field.colName);
				let c2 = new sql.Expression('?');
				let val = Reflect.get(entity, field.fieldName);
				c2.args.push(val);

				let expr = new sql.Expression(null, sql.types.Operator.Equal, c1, c2);
				stat.columns.push(expr);
			});

			stat.where = this.whereExpr(entity);
			return stat;
		});

		await this.context.execute(stmts);
	}

	async insertOrUpdate(entity: T) {
		let idParams: any[] = [];
		this.primaryFields.forEach(field => {
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

	async deleteBulk(entities: T[]) {
		let stmts = entities.map(entity => {
			let stat = new sql.Statement();
			stat.command = sql.types.Command.DELETE;

			stat.collection.value = this.dbSet.tableName;

			stat.where = this.whereExpr(entity);
			return stat;
		});
		await this.context.execute(stmts);
	}

	async get(...idParams: any[]) {
		if (idParams == null) throw new Error('Id parameter cannot be null');

		if (this.primaryFields.length == 0) {
			throw new Error(`No Primary Field Found in Table: ${this.dbSet.tableName}`);
		} else if (this.primaryFields.length != idParams.length) {
			throw new Error('Invalid Arguments Length');
		} else {
			return this.where(a => {
				let expr = new sql.Expression();
				this.primaryFields.forEach((pri, idx) => {
					expr = expr.add(a.eq(<types.KeyOf<T>>pri.fieldName, idParams[idx]));
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
		let q = new QuerySet(this.context, this.EntityType, this.dbSet);
		return q.where(param, args);
	}

	groupBy(func: types.IArrFieldFunc<model.GroupExprBuilder<T>>) {
		let q = new QuerySet(this.context, this.EntityType, this.dbSet);
		return q.groupBy(func);
	}

	orderBy(func: types.IArrFieldFunc<model.OrderExprBuilder<T>>) {
		let q = new QuerySet(this.context, this.EntityType, this.dbSet);
		return q.orderBy(func);
	}

	limit(size: number, index?: number) {
		let q = new QuerySet(this.context, this.EntityType, this.dbSet);
		return q.limit(size, index);
	}

	list() {
		let q = new QuerySet(this.context, this.EntityType, this.dbSet);
		return q.list();
	}

	listPlain(keys: (keyof T)[]) {
		let q = new QuerySet(this.context, this.EntityType, this.dbSet);
		return q.listPlain(keys);
	}

	select<U extends Object>(EntityType: types.IEntityType<U>) {
		let res = new SelectQuerySet(this.context, EntityType, this.dbSet);
		return res;
	}

	// join<A extends Object>(coll: IQuerySet<A>, param: types.IJoinFunc<model.WhereExprBuilder<T>, model.GroupExprBuilder<A>>, joinType?: sql.types.Join) {
	// 	let q = new QuerySet(this.context, this.dbSet);
	// 	return q.join(coll, param, joinType);
	// }
}

export default TableSet;
