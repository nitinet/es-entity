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
	private dbSet: DBSet<T> = null;
	alias: string = null;

	constructor(dbSet: DBSet<T>) {
		super();

		this.dbSet = dbSet;
		this.context = this.dbSet.context;

		this.stat = new sql.Statement();
		this.alias = dbSet.mapping.name.charAt(0);
		this.stat.collection.value = dbSet.mapping.name;
		this.stat.collection.alias = this.alias;
	}

	getEntity(alias?: string) {
		alias = alias || this.stat.collection.alias;
		return this.dbSet.getEntity(alias);
	}

	// Selection Functions
	async list() {
		this.select();

		let result = await this.context.execute(this.stat);
		return this.mapData(result);
	}

	async mapData(input: bean.ResultSet): Promise<Array<T>> {
		return this.dbSet.mapData(input);
	}

	async run() {
		if (!this.stat.columns.length) {
			return this.list();
		}

		let result = await this.context.execute(this.stat);
		return result.rows;
	}

	// Selection Functions
	select(param?: funcs.IArrFieldFunc<T> | sql.Expression | sql.Expression[]) {
		this.stat.command = sql.Command.SELECT;
		if (param) {
			let a = this.getEntity();
			let temp: sql.Expression[] = [];
			if (param instanceof Function) {
				param = param(a);
			}
			if (param instanceof sql.Expression) {
				temp.push(param);
			} else if (param instanceof Array) {
				temp = temp.concat(param);
			}
			temp.forEach(val => {
				this.stat.columns.push(val.expr());
			});
		} else {
			// Get all Columns
			let alias: string = this.stat.collection.alias;

			this.dbSet.mapping.fields.forEach((field) => {
				let c = new sql.Collection();
				c.colAlias = alias;
				c.value = field.colName;
				c.alias = field.fieldName;
				this.stat.columns.push(c);
			});
		}
		return this;
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
						this.stat.groupBy.push(a.expr());
					}
				});
			} else if (res instanceof sql.Expression && res.exps.length > 0) {
				this.stat.groupBy.push(res.expr());
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
						this.stat.orderBy.push(a.expr());
					}
				});
			} else if (res instanceof sql.Expression && res.exps.length > 0) {
				this.stat.orderBy.push(res.expr());
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
			let res: JoinQuerySet<T, A> = new JoinQuerySet<T, A>(this, coll, joinType, temp);
			return res;
		} else {
			throw 'Invalid Join';
		}
	}

}

export default QuerySet;
