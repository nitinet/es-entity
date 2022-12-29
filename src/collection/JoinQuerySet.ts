import IQuerySet from './IQuerySet.js';
import * as sql from '../sql/index.js';
import * as bean from '../bean/index.js';
import * as types from '../types/index.js';

class JoinQuerySet<T extends Object, U extends Object> extends IQuerySet<T & U>{
	mainSet: IQuerySet<T> = null;
	joinSet: IQuerySet<U> = null;

	constructor(mainSet: IQuerySet<T>, joinSet: IQuerySet<U>, joinType: sql.types.Join, expr: sql.Expression) {
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
		// this.stat.command = sql.types.Command.SELECT;

		// let tempObj = this.getEntity();
		// this.setStatColumns(tempObj);

		// let result = await this.context.execute(this.stat);
		// return this.mapData(result);
		//TODO: implementation
		return null;
	}

	async mapData(input: bean.ResultSet): Promise<Array<T & U>> {
		// let resMain = await this.mainSet.mapData(input);
		// let resJoin = await this.joinSet.mapData(input);

		// let res = new Array<T & U>();
		// for (let i = 0; i < input.rowCount; i++) {
		// 	let objMain = resMain[i];
		// 	let objJoin = resJoin[i];
		// 	let objFinal = Object.assign(objMain, objJoin);
		// 	res.push(objFinal);
		// }
		// return res;
		//TODO: implement
		return null;
	}

	async select<V extends T & U>(TargetType: types.IEntityType<V>): Promise<V[]> {
		// this.stat.command = sql.types.Command.SELECT;

		// let a = this.getEntity();
		// let tempObj = TargetType(a);
		// this.setStatColumns(tempObj);

		// let result = await this.context.execute(this.stat);
		// let temps = await this.mapData(result);
		// let res: V[] = [];
		// temps.forEach(t => {
		// 	let r = TargetType(t);
		// 	res.push(r);
		// });

		// return res;
		//TODO: implement
		return null;
	}

	selectPlain(keys: (keyof T & U)[]): Promise<types.SelectType<T & U>[]> {
		//TODO: implement
		return null;
	}

	// Conditional Functions
	where(param?: types.IWhereFunc<sql.OperatorEntity<T & U>>, ...args: any[]): IQuerySet<T & U> {
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

	groupBy(param?: types.IArrFieldFunc<sql.OperatorEntity<T & U>>): IQuerySet<T & U> {
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

	orderBy(param?: types.IArrFieldFunc<sql.OperatorEntity<T & U>>): IQuerySet<T & U> {
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

	limit(size: number, index?: number): IQuerySet<T & U> {
		this.stat.limit = new sql.Expression(null, sql.types.Operator.Limit);
		this.stat.limit.exps.push(new sql.Expression(size.toString()));
		if (index) {
			this.stat.limit.exps.push(new sql.Expression(index.toString()));
		}
		return this;
	}

	join<A>(coll: IQuerySet<A>, param?: types.IJoinFunc<T & U, A> | sql.Expression, joinType?: sql.types.Join) {
		joinType = joinType || sql.types.Join.InnerJoin;

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