import * as bean from '../bean';
import * as sql from '../sql';
import * as funcs from './funcs';
import Context from '../Context';

abstract class IQuerySet<T> {
	context: Context;
	stat: sql.Statement = null;

	abstract getEntity(alias?: string): T;

	// Selection Functions
	abstract list(): Promise<Array<T>>;
	abstract unique(): Promise<T>;
	abstract run(): Promise<Array<any>>;

	// Conditional Functions
	abstract select(param?: funcs.IArrFieldFunc<T> | sql.Expression | sql.Expression[]): IQuerySet<T>;
	abstract where(func?: funcs.IWhereFunc<T> | sql.Expression, ...args: any[]): IQuerySet<T>;
	abstract groupBy(func?: funcs.IArrFieldFunc<T> | sql.Expression | sql.Expression[]): IQuerySet<T>;
	abstract orderBy(func?: funcs.IArrFieldFunc<T> | sql.Expression | sql.Expression[]): IQuerySet<T>;
	abstract limit(size: number, index?: number): IQuerySet<T>;

	abstract mapData(input: bean.ResultSet): Promise<Array<T>>;

	abstract join<A>(collection: IQuerySet<A>, func: funcs.IJoinFunc<T, A> | sql.Expression, joinType?: sql.Join): IQuerySet<T & A>;

	innerJoin<A>(coll: IQuerySet<A>, param?: funcs.IJoinFunc<T, A> | sql.Expression): IQuerySet<T & A> {
		return this.join(coll, param, sql.Join.InnerJoin);
	}

	leftJoin<A>(coll: IQuerySet<A>, param?: funcs.IJoinFunc<T, A> | sql.Expression): IQuerySet<T & A> {
		return this.join(coll, param, sql.Join.LeftJoin);
	}

	rightJoin<A>(coll: IQuerySet<A>, param?: funcs.IJoinFunc<T, A> | sql.Expression): IQuerySet<T & A> {
		return this.join(coll, param, sql.Join.RightJoin);
	}

	outerJoin<A>(coll: IQuerySet<A>, param?: funcs.IJoinFunc<T, A> | sql.Expression): IQuerySet<T & A> {
		return this.join(coll, param, sql.Join.OuterJoin);
	}

}

export default IQuerySet;
