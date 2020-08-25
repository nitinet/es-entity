import IQuerySet from './IQuerySet';
import * as sql from '../sql';
import * as funcs from './funcs';
import * as bean from '../bean';

class JoinQuerySet<T extends Object, U extends Object> extends IQuerySet<T & U>{
	mainSet: IQuerySet<T> = null;
	joinSet: IQuerySet<U> = null;

	constructor(mainSet: IQuerySet<T>, joinSet: IQuerySet<U>, joinType: sql.Join, expr: sql.Expression) {
		super();
		this.mainSet = mainSet;
		this.context = mainSet.context;

		this.joinSet = joinSet;

		this.stat = new sql.Statement();

		this.stat.collection.leftColl = this.mainSet.stat.collection;
		this.stat.collection.rightColl = this.joinSet.stat.collection;
		this.stat.collection.join = joinType;

		this.stat.where = this.stat.where.add(expr);
	}

	getEntity(alias?: string): T & U {
		let mainObj = this.mainSet.getEntity(alias);
		let joinObj = this.joinSet.getEntity(alias);
		return Object.assign(mainObj, joinObj);
	}

	// Selection Functions
	async list(): Promise<Array<T & U>> {
		this.select();

		let result = await this.context.execute(this.stat);
		return this.mapData(result);
	}

	async mapData(input: bean.ResultSet): Promise<Array<T & U>> {
		let resMain = await this.mainSet.mapData(input);
		let resJoin = await this.joinSet.mapData(input);

		let res = new Array<T & U>();
		for (let i = 0; i < input.rowCount; i++) {
			let objMain = resMain[i];
			let objJoin = resJoin[i];
			let objFinal = Object.assign(objMain, objJoin);
			res.push(objFinal);
		}
		return res;
	}

	async unique(): Promise<T & U> {
		let l = await this.list();
		if (l.length > 1) {
			throw new Error('More than one row found in unique call');
		} else {
			return l[0];
		}
	}

	async run() {
		if (!this.stat.columns.length) {
			return this.list();
		}

		let result = await this.context.execute(this.stat);
		return result.rows;
	}

	select(param?: funcs.IArrFieldFunc<T & U> | sql.Expression | sql.Expression[]): IQuerySet<T & U> {
		this.stat.command = sql.Command.SELECT;

		if (param) {
			let temp: sql.Expression[] = [];
			if (param instanceof Function) {
				let a = this.getEntity();
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
			this.mainSet = this.mainSet.select();
			this.mainSet.stat.columns.forEach((col) => {
				this.stat.columns.push(col);
			});

			this.joinSet = this.joinSet.select();
			this.joinSet.stat.columns.forEach((col) => {
				this.stat.columns.push(col);
			});
		}
		return this;
	}

	// Conditional Functions
	where(param?: funcs.IWhereFunc<T & U> | sql.Expression, ...args: any[]): IQuerySet<T & U> {
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

	groupBy(param?: funcs.IArrFieldFunc<T> | sql.Expression | sql.Expression[]): IQuerySet<T & U> {
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

	orderBy(param?: funcs.IArrFieldFunc<T> | sql.Expression | sql.Expression[]): IQuerySet<T & U> {
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

	limit(size: number, index?: number): IQuerySet<T & U> {
		this.stat.limit = new sql.Expression(null, sql.Operator.Limit);
		if (index) {
			this.stat.limit.exps.push(new sql.Expression(index.toString()));
		}
		this.stat.limit.exps.push(new sql.Expression(size.toString()));
		return this;
	}

	join<A>(coll: IQuerySet<A>, param?: funcs.IJoinFunc<T & U, A> | sql.Expression, joinType?: sql.Join) {
		joinType = joinType | sql.Join.InnerJoin;

		let temp: sql.Expression = null;
		if (param instanceof Function) {
			let a = this.getEntity();
			let b = coll.getEntity();
			temp = param(a, b);
		} else {
			temp = param;
		}
		let res: JoinQuerySet<T & U, A> = null;
		if (temp instanceof sql.Expression && temp.exps.length > 0) {
			res = new JoinQuerySet<T & U, A>(this, coll, joinType, temp);
		}
		return res;
	}

}

export default JoinQuerySet;
