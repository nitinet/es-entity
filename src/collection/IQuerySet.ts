import * as sql from '../sql/index.js';
import * as funcs from '../types/index.js';
import IEntityType from '../types/IEntityType.js';
import SelectType from '../types/SelectType.js';
import Context from '../Context.js';
import OperatorEntity from '../model/OperatorEntity.js';

abstract class IQuerySet<T extends Object> {
	context: Context;
	stat: sql.Statement = null;

	abstract getEntity(alias?: string): T;

	// Selection Functions
	abstract list(): Promise<Array<T>>;

	async unique(): Promise<T> {
		let arr = await this.list();
		if (arr.length > 1) throw new Error('More than one row found in unique call');
		else return arr[0];
	}

	abstract select<U extends T>(TargetType: IEntityType<U>): Promise<U[]>;
	abstract selectPlain(keys: (keyof T)[]): Promise<SelectType<T>[]>;

	abstract where(func?: funcs.IWhereFunc<OperatorEntity<T>>, ...args: any[]): IQuerySet<T>;
	abstract groupBy(func?: funcs.IArrFieldFunc<OperatorEntity<T>>): IQuerySet<T>;
	abstract orderBy(func?: funcs.IArrFieldFunc<OperatorEntity<T>>): IQuerySet<T>;
	abstract limit(size: number, index?: number): IQuerySet<T>;

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

}

export default IQuerySet;
