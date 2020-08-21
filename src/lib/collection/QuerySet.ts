import * as bean from '../../bean';
import * as sql from '../sql';
import * as funcs from './funcs';
import IQuerySet from './IQuerySet';
import DBSet from './DBSet';

/**
 * QuerySet
 */
class QuerySet<T extends Object> implements IQuerySet<T> {
	private dbSet: DBSet<T> = null;
	private stat: sql.Statement = null;

	constructor(stat: sql.Statement, dbSet: DBSet<T>) {
		this.stat = stat;
		this.dbSet = dbSet;
	}

	getEntity(alias?: string) {
		alias = alias || this.stat.collection.alias;
		return this.dbSet.getEntity(alias);
	}

	// Selection Functions
	async list() {
		this.stat.command = sql.Command.SELECT;
		let alias: string = this.stat.collection.alias;

		this.dbSet.mapping.fields.forEach((field) => {
			let c = new sql.Collection();
			c.colAlias = alias;
			c.value = field.colName;
			c.alias = field.fieldName;
			this.stat.columns.push(c);
		});

		let result = await this.dbSet.context.execute(this.stat);
		return this.mapData(result);
	}

	async mapData(input: bean.ResultSet): Promise<Array<T>> {
		return this.dbSet.mapData(input);
	}

	// Selection Functions
	async select(param?: funcs.IArrFieldFunc<T> | sql.Expression | sql.Expression[]) {
		this.stat.command = sql.Command.SELECT;
		if (param) {
			let a = this.getEntity();
			let temp: sql.Expression[] = [];
			if (typeof param == 'function') {
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
			let alias: string = this.stat.collection.alias;
			this.dbSet.mapping.fields.forEach((field) => {
				let c = new sql.Collection();
				c.colAlias = alias;
				c.value = field.colName;
				c.alias = field.fieldName;
				this.stat.columns.push(c);
			});
		}

		let result = await this.dbSet.context.execute(this.stat);
		return result.rows;
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
				for (let i = 0; i < res.length; i++) {
					if (res[i] instanceof sql.Expression && res[i].exps.length > 0) {
						this.stat.groupBy.push((<sql.Expression>res[i]).expr());
					}
				}
			} else {
				if (res instanceof sql.Expression && res.exps.length > 0) {
					this.stat.groupBy.push(res.expr());
				}
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
				for (let i = 0; i < res.length; i++) {
					if (res[i] instanceof sql.Expression && res[i].exps.length > 0) {
						this.stat.orderBy.push((<sql.Expression>res[i]).expr());
					}
				}
			} else {
				if (res instanceof sql.Expression && res.exps.length > 0) {
					this.stat.orderBy.push(res.expr());
				}
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

}

export default QuerySet;
