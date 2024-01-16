import * as bean from '../bean/index.js';
import * as model from '../model/index.js';
import * as types from '../model/types.js';
import * as sql from '../sql/index.js';
import IQuerySet from './IQuerySet.js';

class JoinQuerySet<T extends Object, U extends Object> extends IQuerySet<T & U>{

	private mainSet: IQuerySet<T>;
	private joinSet: IQuerySet<U>;

	stat: sql.Statement = new sql.Statement();

	constructor(mainSet: IQuerySet<T>, joinSet: IQuerySet<U>, joinType: sql.types.Join, expr: sql.Expression) {
		super();
		this.mainSet = mainSet;
		this.context = mainSet.context;

		this.joinSet = joinSet;

		this.stat = new sql.Statement();

		// this.stat.collection.leftColl = this.mainSet.stat.collection;
		// this.stat.collection.rightColl = this.joinSet.stat.collection;
		this.stat.collection.join = joinType;

		this.stat.where = this.stat.where.add(expr);
	}

	// getEntity(): T & U {
	// 	let mainObj = this.mainSet.getEntity();
	// 	let joinObj = this.joinSet.getEntity();
	// 	return Object.assign(mainObj, joinObj);
	// 	// return null;
	// }

	// Selection Functions
	async list(): Promise<Array<T & U>> {
		// this.stat.command = sql.types.Command.SELECT;

		// let tempObj = this.getEntity();
		// this.setStatColumns(tempObj);

		// let result = await this.context.execute(this.stat);
		// return this.mapData(result);
		//TODO: implementation
		return new Array();
	}

	listPlain(keys: (keyof T | keyof U)[]): Promise<Partial<T & U>[]> {
		throw new Error('Method not implemented.');
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
		return new Array();
	}

	// select<V extends Object = types.SubEntityType<T & U>>(TargetType: types.IEntityType<V>): IQuerySet<V> {
	select<V extends Object>(EntityType: types.IEntityType<V>): IQuerySet<V> {
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
		throw new Error('Method not implemented.');
	}

	// selectPlain(keys: (keyof T & U)[]): Promise<types.SelectType<T & U>[]> {
	selectPlain(keys: (keyof T & U)[]): any {
		//TODO: implement
		return null;
	}

	// Conditional Functions
	where(param: types.IWhereFunc<model.WhereExprBuilder<T & U>>, ...args: any[]): IQuerySet<T & U> {
		// let res = null;
		// if (param && param instanceof Function) {
		// 	//TODO: fix join fieldMap
		// 	let mainFieldMap = this.context.tableSetMap.get(null).fieldMap;
		// 	let joinFieldMap = this.context.tableSetMap.get(null).fieldMap;
		// 	let finalFieldMap = new Map([...mainFieldMap, ...joinFieldMap]);

		// 	let op = new model.WhereExprBuilder<T & U>(finalFieldMap);
		// 	res = param(op, args);
		// }
		// if (res && res instanceof sql.Expression && res.exps.length > 0) {
		// 	this.stat.where = this.stat.where.add(res);
		// }
		return this;
	}

	groupBy(param: types.IArrFieldFunc<model.GroupExprBuilder<T & U>>): IQuerySet<T & U> {
		// let res = null;
		// if (param && param instanceof Function) {
		// 	//TODO: fix join fieldMap
		// 	let mainFieldMap = this.context.tableSetMap.get(Object)?.fieldMap;
		// 	let joinFieldMap = this.context.tableSetMap.get(Object)?.fieldMap;
		// 	let finalFieldMap = new Map([...mainFieldMap, ...joinFieldMap]);

		// 	let op = new model.GroupExprBuilder<T & U>(finalFieldMap);
		// 	res = param(op);
		// }
		// if (res && Array.isArray(res)) {
		// 	res.forEach(a => {
		// 		if (a instanceof sql.Expression && a.exps.length > 0) {
		// 			this.stat.groupBy.push(a);
		// 		}
		// 	});
		// }
		return this;
	}

	orderBy(param: types.IArrFieldFunc<model.OrderExprBuilder<T & U>>): IQuerySet<T & U> {
		// let res = null;
		// if (param && param instanceof Function) {
		// 	//TODO: fix join fieldMap
		// 	let mainFieldMap = this.context.tableSetMap.get(null)?.fieldMap;
		// 	let joinFieldMap = this.context.tableSetMap.get(null)?.fieldMap;
		// 	let finalFieldMap = new Map([...mainFieldMap, ...joinFieldMap]);

		// 	let op = new model.OrderExprBuilder<T & U>(finalFieldMap);
		// 	res = param(op);
		// }
		// if (res && Array.isArray(res)) {
		// 	res.forEach(expr => {
		// 		if (expr instanceof sql.Expression && expr.exps.length > 0) {
		// 			this.stat.orderBy.push(expr);
		// 		}
		// 	});
		// }
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

	// join<A extends Object>(coll: IQuerySet<A>, param: types.IJoinFunc<model.WhereExprBuilder<T & U>, model.GroupExprBuilder<A>>, joinType?: sql.types.Join): IQuerySet<T & U & A> {
	// 	joinType = joinType || sql.types.Join.InnerJoin;

	// 	let temp: sql.Expression | null = null;
	// 	if (param && param instanceof Function) {
	// 		let mainObj = this.getEntity(); new model.WhereExprBuilder<T>(this.dbSet.fieldMap);
	// 		let joinObj = coll.getEntity();
	// 		temp = param(mainObj, joinObj);
	// 	}
	// 	let res: JoinQuerySet<T & U, A>;
	// 	if (temp instanceof sql.Expression && temp.exps.length > 0) {
	// 		res = new JoinQuerySet<T & U, A>(this, coll, joinType, temp);
	// 	} else {
	// 		throw new TypeError('Invalid Join');
	// 	}
	// 	return res;
	// }

}

export default JoinQuerySet;
