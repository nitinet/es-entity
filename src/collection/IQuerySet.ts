import * as bean from '../bean/index.js';
import * as sql from '../sql/index.js';
import * as funcs from '../funcs/index.js';
import Context from '../Context.js';

abstract class IQuerySet<T> {
	context: Context;
	stat: sql.Statement = null;

	abstract getEntity(alias?: string): T;

	// Selection Functions
	abstract list(): Promise<Array<T>>;
	abstract unique(): Promise<T>;
	abstract select<U extends Object>(param?: funcs.ISelectFunc<T, U>): Promise<U[]>;

	abstract where(func?: funcs.IWhereFunc<T> | sql.Expression, ...args: any[]): IQuerySet<T>;
	abstract groupBy(func?: funcs.IArrFieldFunc<T> | sql.Expression | sql.Expression[]): IQuerySet<T>;
	abstract orderBy(func?: funcs.IArrFieldFunc<T> | sql.Expression | sql.Expression[]): IQuerySet<T>;
	abstract limit(size: number, index?: number): IQuerySet<T>;

	abstract mapData(input: bean.ResultSet): Promise<Array<T>>;

	abstract join<A>(collection: IQuerySet<A>, func: funcs.IJoinFunc<T, A> | sql.Expression, joinType?: sql.types.Join): IQuerySet<T & A>;

	innerJoin<A>(coll: IQuerySet<A>, param?: funcs.IJoinFunc<T, A> | sql.Expression): IQuerySet<T & A> {
		return this.join(coll, param, sql.types.Join.InnerJoin);
	}

	leftJoin<A>(coll: IQuerySet<A>, param?: funcs.IJoinFunc<T, A> | sql.Expression): IQuerySet<T & A> {
		return this.join(coll, param, sql.types.Join.LeftJoin);
	}

	rightJoin<A>(coll: IQuerySet<A>, param?: funcs.IJoinFunc<T, A> | sql.Expression): IQuerySet<T & A> {
		return this.join(coll, param, sql.types.Join.RightJoin);
	}

	outerJoin<A>(coll: IQuerySet<A>, param?: funcs.IJoinFunc<T, A> | sql.Expression): IQuerySet<T & A> {
		return this.join(coll, param, sql.types.Join.OuterJoin);
	}

	// utils functions
	setStatColumns(tempObj:any) {
		let tempKeys = Reflect.ownKeys(tempObj);
		tempKeys.forEach(k => {
			let f = tempObj[k];
			if (f instanceof sql.Field) {
				let exp = f.expr();
				this.stat.columns.push(exp);
			}
		});
		return this;
	}

}

export default IQuerySet;
