import * as bean from '../bean';
import * as sql from '../sql';
import * as funcs from './funcs';
import IQuerySet from './IQuerySet';
import DBSet from './DBSet';
import JoinQuerySet from './JoinQuerySet';

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
		this.stat.command = sql.Command.SELECT;
		// Get all Columns

		let tempObj = this.getEntity();
		this.setStatColumns(tempObj);

		// this.dbSet.mapping.fields.forEach((field) => {
		// 	let c = new sql.Collection();
		// 	c.colAlias = alias;
		// 	c.value = field.colName;
		// 	c.alias = field.fieldName;
		// 	this.stat.columns.push(c);
		// });

		let result = await this.context.execute(this.stat);
		return this.mapData(result);
	}

	async mapData(input: bean.ResultSet): Promise<Array<T>> {
		return this.dbSet.mapData(input);
	}

	// async run() {
	// 	if (!this.stat.columns.length) {
	// 		return this.list();
	// 	} else {
	// 		let result = await this.context.execute(this.stat);
	// 		return result.rows;
	// 	}
	// }

	// Selection Functions
	async select<U extends Object>(param?: funcs.ISelectFunc<T, U>) {
		this.stat.command = sql.Command.SELECT;
		if (!(param && param instanceof Function)) {
			throw new Error('Select Function not found');
		}

		let a = this.getEntity();
		let tempObj = param(a);
		this.setStatColumns(tempObj);

		let result = await this.context.execute(this.stat);
		let temps = await this.mapData(result);
		let res: U[] = [];
		temps.forEach(t => {
			let r = param(t);
			res.push(r);
		});

		return res;
	}

	async unique() {
		let l = await this.list();
		if (l.length > 1) {
			throw new Error('More than one row found in unique call');
		} else {
			return l[0];
		}
	}

	// Conditional Functions
	where(param?: funcs.IWhereFunc<T> | sql.Expression, ...args: any[]): IQuerySet<T> {
		let res = null;
		if (param) {
			if (param instanceof Function) {
				let a = this.getEntity();
				res = param(a, args);
			} else {
				res = param;
			}
		}
		if (res && res instanceof sql.Expression && res.exps.length > 0) {
			this.stat.where = this.stat.where.add(res);
		}
		return this;
	}

	groupBy(param?: funcs.IArrFieldFunc<T> | sql.Expression[]): IQuerySet<T> {
		let res = null;
		if (param) {
			if (param instanceof Function) {
				let a = this.getEntity();
				res = param(a);
			} else if (param instanceof Array) {
				res = param;
			}
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

	orderBy(param?: funcs.IArrFieldFunc<T> | sql.Expression[]): IQuerySet<T> {
		let res = null;
		if (param) {
			if (param instanceof Function) {
				let a = this.getEntity();
				res = param(a);
			} else if (param instanceof Array) {
				res = param;
			}
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
		this.stat.limit = new sql.Expression(null, sql.Operator.Limit);
		if (index) {
			this.stat.limit.exps.push(new sql.Expression(index.toString()));
		}
		this.stat.limit.exps.push(new sql.Expression(size.toString()));
		return this;
	}

	async update(param?: funcs.IUpdateFunc<T>): Promise<void> {
		if (!(param && param instanceof Function)) {
			throw new Error('Select Function not found');
		}

		let stat = new sql.Statement();
		stat.command = sql.Command.UPDATE;
		stat.collection.value = this.dbSet.mapping.name;

		let a = this.getEntity();
		let tempObj = param(a);

		Reflect.ownKeys(tempObj).forEach((key) => {
			let field = this.dbSet.getKeyField(key);

			let q = tempObj[key];
			if (q instanceof sql.Field && q._updated) {
				let c1 = new sql.Expression(field.colName);
				let c2 = new sql.Expression('?');
				c2.args.push(this.dbSet.getValue(tempObj, <string>key));

				let c = new sql.Expression(null, sql.Operator.Equal, c1, c2);
				stat.columns.push(c);
			}
		});

		if (stat.columns.length > 0) {
			let result = await this.context.execute(stat);
			if (result.error) {
				throw result.error;
			}
		}
	}

	async delete(): Promise<void> {
		let stat = new sql.Statement();
		stat.command = sql.Command.DELETE;
		stat.collection.value = this.dbSet.mapping.name;

		await this.context.execute(stat);
	}

	join<A>(coll: IQuerySet<A>, param?: funcs.IJoinFunc<T, A> | sql.Expression, joinType?: sql.Join) {
		joinType = joinType | sql.Join.InnerJoin;

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
