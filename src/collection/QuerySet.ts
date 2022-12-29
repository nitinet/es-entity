import * as bean from '../bean/index.js';
import * as sql from '../sql/index.js';
import * as types from '../types/index.js';
import * as model from '../model/index.js';
import IQuerySet from './IQuerySet.js';
import DBSet from './DBSet.js';
import JoinQuerySet from './JoinQuerySet.js';

/**
 * QuerySet
 */
class QuerySet<T extends Object> extends IQuerySet<T> {
	protected dbSet: DBSet<T> = null;
	alias: string = null;

	constructor(dbSet?: DBSet<T>) {
		super();
		if (dbSet) {
			this.bind(dbSet);
		}
	}

	bind(dbSet: DBSet<T>) {
		if (dbSet) {
			this.dbSet = dbSet;
			this.context = this.dbSet.context;

			this.stat = new sql.Statement();
			this.alias = dbSet.mapping.name.charAt(0);
			this.stat.collection.value = dbSet.mapping.name;
			this.stat.collection.alias = this.alias;
		}
	}

	getEntity(alias?: string) {
		alias = alias || this.stat.collection.alias;
		return this.dbSet.getEntity(alias);
	}

	// Selection Functions
	async list() {
		this.stat.command = sql.types.Command.SELECT;
		// Get all Columns

		let temp = new (this.dbSet.getEntityType());
		let targetKeys = <string[]>Reflect.ownKeys(temp);
		let fields = this.dbSet.filterFields(targetKeys);
		this.stat.columns = this.dbSet.getColumnExprs(fields, this.alias);

		let result = await this.context.execute(this.stat);
		return this.mapData(this.dbSet.getEntityType(), result);
	}

	// Selection Functions
	async select<U extends T>(TargetType: types.IEntityType<U>) {
		this.stat.command = sql.types.Command.SELECT;

		let temp = new TargetType();
		let targetKeys = <string[]>Reflect.ownKeys(temp);
		let fields = this.dbSet.filterFields(targetKeys);
		this.stat.columns = this.dbSet.getColumnExprs(fields, this.alias);

		let result = await this.context.execute(this.stat);
		return this.mapData(TargetType, result);
	}

	async selectPlain(keys: (keyof T)[]) {
		this.stat.command = sql.types.Command.SELECT;

		let fields = this.dbSet.filterFields(<string[]>keys);
		this.stat.columns = this.dbSet.getColumnExprs(fields, this.alias);

		let input = await this.context.execute(this.stat);
		let data = input.rows.map(row => {
			let obj: types.SelectType<T> = {};
			keys.forEach(key => {
				let fieldMapping = this.dbSet.mapping.fields.find(f => f.fieldName == key);
				let colName = fieldMapping.colName;
				obj[key] = row[colName] ?? row[colName.toLowerCase()] ?? row[colName.toUpperCase()];
			});
			return obj;
		});
		return data;
	}

	private async mapData<U extends Object>(TargetEntityType: types.IEntityType<U>, input: bean.ResultSet): Promise<Array<U>> {
		let data = input.rows.map(row => {
			let obj = new TargetEntityType();
			let keys = (<string[]>Reflect.ownKeys(obj));

			keys.forEach(key => {
				let field = Reflect.get(obj, key);
				let fieldMapping = this.dbSet.mapping.fields.find(f => f.fieldName == key);
				if (fieldMapping) {
					let colName = fieldMapping.colName;
					field = row[colName] ?? row[colName.toLowerCase()] ?? row[colName.toUpperCase()];
				} else if (field instanceof model.LinkObject || field instanceof model.LinkArray) {
					field.bind(this.context);
				}
			});
			return obj;
		});
		return data;
	}

	// Conditional Functions
	where(param?: types.IWhereFunc<sql.OperatorEntity<T>>, ...args: any[]): IQuerySet<T> {
		let res = null;
		if (param && param instanceof Function) {
			let a = new sql.OperatorEntity()
			res = param(a, args);
		}
		if (res && res instanceof sql.Expression && res.exps.length > 0) {
			this.stat.where = this.stat.where.add(res);
		}
		return this;
	}

	groupBy(param?: types.IArrFieldFunc<sql.OperatorEntity<T>>): IQuerySet<T> {
		let res = null;
		if (param && param instanceof Function) {
			let a = new sql.OperatorEntity()
			res = param(a);
		}
		if (res) {
			if (res instanceof Array) {
				res.forEach(a => {
					if (a instanceof sql.Expression && a.exps.length > 0) {
						this.stat.groupBy.push(a);
					}
				});
			} else if (res instanceof sql.Expression && res.exps.length > 0) {
				this.stat.groupBy.push(res);
			}
		}
		return this;
	}

	orderBy(param?: types.IArrFieldFunc<sql.OperatorEntity<T>>): IQuerySet<T> {
		let res = null;
		if (param && param instanceof Function) {
			let a = new sql.OperatorEntity()
			res = param(a);
		}
		if (res) {
			if (res instanceof Array) {
				res.forEach(a => {
					if (a instanceof sql.Expression && a.exps.length > 0) {
						this.stat.orderBy.push(a);
					}
				});
			} else if (res instanceof sql.Expression && res.exps.length > 0) {
				this.stat.orderBy.push(res);
			}
		}
		return this;
	}

	limit(size: number, index?: number): IQuerySet<T> {
		this.stat.limit = new sql.Expression(null, sql.types.Operator.Limit);
		this.stat.limit.exps.push(new sql.Expression(size.toString()));
		if (index) {
			this.stat.limit.exps.push(new sql.Expression(index.toString()));
		}
		return this;
	}

	async update(param: types.IUpdateFunc<T>): Promise<void> {
		if (!(param && param instanceof Function)) {
			throw new Error('Select Function not found');
		}

		let stat = new sql.Statement();
		stat.command = sql.types.Command.UPDATE;
		stat.collection.value = this.dbSet.mapping.name;

		let a = this.getEntity();
		let tempObj = param(a);

		Reflect.ownKeys(tempObj).forEach((key) => {
			let field = this.dbSet.getKeyField(key);
			if (!field) return;

			// TODO: dynamic update
			let c1 = new sql.Expression(field.colName);
			let c2 = new sql.Expression('?');
			c2.args.push(Reflect.get(tempObj, key));

			let c = new sql.Expression(null, sql.types.Operator.Equal, c1, c2);
			stat.columns.push(c);
		});

		if (stat.columns.length > 0) {
			let result = await this.context.execute(stat);
			if (result.error) {
				throw result.error;
			}
		}
	}

	join<A>(coll: IQuerySet<A>, param?: types.IJoinFunc<T, A> | sql.Expression, joinType?: sql.types.Join): IQuerySet<T & A> {
		joinType = joinType | sql.types.Join.InnerJoin;

		let temp: sql.Expression = null;
		if (param) {
			if (param instanceof Function) {
				let a = this.getEntity();
				let b = coll.getEntity();
				temp = param(a, b);
			} else {
				temp = param;
			}
		}

		if (temp && temp instanceof sql.Expression && temp.exps.length > 0) {
			return new JoinQuerySet<T, A>(this, coll, joinType, temp);
		} else {
			throw new Error('Invalid Join');
		}
	}

}

export default QuerySet;
