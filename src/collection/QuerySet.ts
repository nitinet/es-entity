import * as bean from '../bean/index.js';
import * as sql from '../sql/index.js';
import * as types from '../model/types.js';
import * as model from '../model/index.js';
import IQuerySet from './IQuerySet.js';
import DBSet from './DBSet.js';
import JoinQuerySet from './JoinQuerySet.js';
import Context from '../Context.js';

/**
 * QuerySet
 */
class QuerySet<T extends Object> extends IQuerySet<T> {
	protected dbSet: DBSet<T>;
	alias: string | undefined;
	stat = new sql.Statement();

	protected EntityType: types.IEntityType<T>;

	constructor(context: Context, dbSet: DBSet<T> | undefined) {
		super();

		this.context = context;
		if (!dbSet) throw new TypeError('Invalid Entity');

		this.dbSet = dbSet;
		this.bind(dbSet);
		this.EntityType = this.dbSet.getEntityType();
	}

	private bind(dbSet: DBSet<T>) {
		this.alias = dbSet.tableName.charAt(0);
		this.stat.collection.value = dbSet.tableName;
		this.stat.collection.alias = this.alias;
	}

	getEntity() {
		let res = new this.EntityType();
		// let keys = Reflect.ownKeys(res);
		// keys.forEach(key => {
		// 	let field = Reflect.get(res, key);
		// 	if (field instanceof model.LinkObject || field instanceof model.LinkArray) {
		// 		field.bind(this.context);
		// 	}
		// });
		return res;
	}

	// Selection Functions
	async list() {
		this.stat.command = sql.types.Command.SELECT;

		// Get all Columns
		let temp = new this.EntityType();
		let targetKeys = <string[]>Reflect.ownKeys(temp);
		let fields = this.dbSet.filterFields(targetKeys);
		this.stat.columns = this.getColumnExprs(fields, this.alias);

		let result = await this.context.execute(this.stat);
		return this.mapData(result);
	}

	// Selection Functions
	async select<V extends Object = types.SubEntityType<T>>(TargetType: types.IEntityType<V>): Promise<V[]> {
		// TODO: implementation
		// let res = new QuerySet<T, V>(this.context, this.dbSet, TargetType);
		// return res;
		return new Array<V>();
	}

	async selectPlain(keys: (keyof T)[]) {
		this.stat.command = sql.types.Command.SELECT;

		let fields = this.dbSet.filterFields(<string[]>keys);
		this.stat.columns = this.getColumnExprs(fields, this.alias);

		let input = await this.context.execute(this.stat);
		let data = input.rows.map(row => {
			let obj: types.SelectType<T> = {};
			fields.forEach(field => {
				let colName = field.colName;
				let val = row[colName] ?? row[colName.toLowerCase()] ?? row[colName.toUpperCase()];
				Reflect.set(obj, field.fieldName, val);
			});
			return obj;
		});
		return data;
	}

	private async mapData(input: bean.ResultSet) {
		let keys = (<string[]>Reflect.ownKeys(new this.EntityType()));

		let data = input.rows.map(row => {
			let obj = new this.EntityType();
			keys.forEach(key => {
				let fieldMapping = this.dbSet.fieldMap.get(key);
				if (fieldMapping) {
					let colName = fieldMapping.colName;
					let val = row[colName];
					Reflect.set(obj, key, val);
				} else {
					let field = Reflect.get(obj, key);
					if (field instanceof model.LinkObject || field instanceof model.LinkArray) {
						field.bind(this.context, obj);
					}
				}
			});
			return obj;
		});
		return data;
	}

	// Conditional Functions
	where(param: types.IWhereFunc<model.WhereExprBuilder<T>>, ...args: any[]) {
		let fieldMap = new Map(Array.from(this.dbSet.fieldMap));
		let eb = new model.WhereExprBuilder<T>(fieldMap);
		let res = param(eb, args);
		if (res && res instanceof sql.Expression && res.exps.length > 0) {
			this.stat.where = this.stat.where.add(res);
		}
		return this;
	}

	groupBy(param: types.IArrFieldFunc<model.GroupExprBuilder<T>>) {
		let fieldMap = new Map(Array.from(this.dbSet.fieldMap));
		let eb = new model.GroupExprBuilder<T>(fieldMap);
		let res = param(eb);
		if (res && Array.isArray(res)) {
			res.forEach(expr => {
				if (expr instanceof sql.Expression && expr.exps.length > 0) {
					this.stat.groupBy.push(expr);
				}
			});
		}
		return this;
	}

	orderBy(param: types.IArrFieldFunc<model.OrderExprBuilder<T>>) {
		let fieldMap = new Map(Array.from(this.dbSet.fieldMap));
		let eb = new model.OrderExprBuilder<T>(fieldMap);
		let res = param(eb);
		if (res && Array.isArray(res)) {
			res.forEach(a => {
				if (a instanceof sql.Expression && a.exps.length > 0) {
					this.stat.orderBy.push(a);
				}
			});
		}
		return this;
	}

	limit(size: number, index?: number) {
		this.stat.limit = new sql.Expression(null, sql.types.Operator.Limit);
		this.stat.limit.exps.push(new sql.Expression(size.toString()));
		if (index) {
			this.stat.limit.exps.push(new sql.Expression(index.toString()));
		}
		return this;
	}

	async update(param: types.IUpdateFunc<T>) {
		this.stat.command = sql.types.Command.UPDATE;

		let obj = this.getEntity();
		let tempObj = param(obj);

		// Dynamic update
		let fields = this.dbSet.filterFields(Reflect.ownKeys(tempObj.obj))
			.filter(field => (<(string | symbol)[]>tempObj.updatedKeys).includes(field.fieldName));
		fields.forEach((field) => {
			let c1 = new sql.Expression(field.colName);
			let c2 = new sql.Expression('?');
			let val = Reflect.get(tempObj, field.fieldName);
			c2.args.push(val);

			let expr = new sql.Expression(null, sql.types.Operator.Equal, c1, c2);
			this.stat.columns.push(expr);
		});

		if (this.stat.columns.length > 0) {
			let result = await this.context.execute(this.stat);
			if (result.error) throw result.error;
		}
	}

	async delete() {
		this.stat.command = sql.types.Command.DELETE;

		let result = await this.context.execute(this.stat);
		if (result.error) throw result.error;
	}

	join<A extends Object>(coll: IQuerySet<A>, param: types.IJoinFunc<T, A>, joinType?: sql.types.Join): IQuerySet<T & A> {
		joinType = joinType ?? sql.types.Join.InnerJoin;

		let temp: sql.Expression | null = null;
		if (param && param instanceof Function) {
			let mainObj = this.getEntity();
			let joinObj = coll.getEntity();
			temp = param(mainObj, joinObj);
		}

		if (!(temp && temp instanceof sql.Expression && temp.exps.length > 0))
			throw new Error('Invalid Join');

		return new JoinQuerySet<T, A>(this, coll, joinType, temp);
	}

}

export default QuerySet;
