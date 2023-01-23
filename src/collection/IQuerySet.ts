import * as sql from '../sql/index.js';
import * as types from '../model/types.js';
import Context from '../Context.js';
import * as model from '../model/index.js';

abstract class IQuerySet<T extends Object> {
	context: Context;
	stat: sql.Statement = new sql.Statement();

	constructor(context: Context) {
		this.context = context;
	}

	abstract getEntity(): T;

	// Selection Functions
	abstract list(): Promise<Array<T>>;

	async unique(): Promise<T> {
		let arr = await this.list();
		if (arr.length > 1) throw new Error('More than one row found in unique call');
		else return arr[0];
	}

	abstract selectPlain(keys: (keyof T)[]): Promise<types.SelectType<T>[]>;

	abstract select<U extends Object = types.SubEntityType<T>>(TargetType: types.IEntityType<U>): IQuerySet<U>;
	abstract where(func: types.IWhereFunc<model.WhereExprBuilder<T>>, ...args: any[]): IQuerySet<T>;
	abstract groupBy(func: types.IArrFieldFunc<model.GroupExprBuilder<T>>): IQuerySet<T>;
	abstract orderBy(func: types.IArrFieldFunc<model.OrderExprBuilder<T>>): IQuerySet<T>;
	abstract limit(size: number, index?: number): IQuerySet<T>;

	abstract join<A extends Object>(collection: IQuerySet<A>, func: types.IJoinFunc<T, A>, joinType?: sql.types.Join): IQuerySet<T & A>;

	innerJoin<A extends Object>(coll: IQuerySet<A>, param: types.IJoinFunc<T, A>): IQuerySet<T & A> {
		return this.join(coll, param, sql.types.Join.InnerJoin);
	}

	leftJoin<A extends Object>(coll: IQuerySet<A>, param: types.IJoinFunc<T, A>): IQuerySet<T & A> {
		return this.join(coll, param, sql.types.Join.LeftJoin);
	}

	rightJoin<A extends Object>(coll: IQuerySet<A>, param: types.IJoinFunc<T, A>): IQuerySet<T & A> {
		return this.join(coll, param, sql.types.Join.RightJoin);
	}

	outerJoin<A extends Object>(coll: IQuerySet<A>, param: types.IJoinFunc<T, A>): IQuerySet<T & A> {
		return this.join(coll, param, sql.types.Join.OuterJoin);
	}

	// Util function
	getColumnExprs(fields: model.FieldMapping[], alias?: string) {
		let exprs = fields.map(field => {
			let val = alias ? alias + '.' + field.colName : field.colName;
			return new sql.Expression(val);
		});
		return exprs;
	}

}

export default IQuerySet;
