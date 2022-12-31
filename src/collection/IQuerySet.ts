import * as sql from '../sql/index.js';
import * as types from '../types/index.js';
import Context from '../Context.js';
import * as model from '../model/index.js';

abstract class IQuerySet<T extends model.Entity> {
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

	abstract select<U extends T>(TargetType: types.IEntityType<U>): Promise<U[]>;
	abstract selectPlain(keys: (keyof T)[]): Promise<types.SelectType<T>[]>;

	abstract where(func: types.IWhereFunc<model.OperatorEntity<T>>, ...args: any[]): IQuerySet<T>;
	abstract groupBy(func: types.IArrFieldFunc<model.OperatorEntity<T>>): IQuerySet<T>;
	abstract orderBy(func: types.IArrFieldFunc<model.OperatorEntity<T>>): IQuerySet<T>;
	abstract limit(size: number, index?: number): IQuerySet<T>;

	abstract join<A extends model.Entity>(collection: IQuerySet<A>, func: types.IJoinFunc<T, A>, joinType?: sql.types.Join): IQuerySet<T & A>;

	innerJoin<A extends model.Entity>(coll: IQuerySet<A>, param: types.IJoinFunc<T, A>): IQuerySet<T & A> {
		return this.join(coll, param, sql.types.Join.InnerJoin);
	}

	leftJoin<A extends model.Entity>(coll: IQuerySet<A>, param: types.IJoinFunc<T, A>): IQuerySet<T & A> {
		return this.join(coll, param, sql.types.Join.LeftJoin);
	}

	rightJoin<A extends model.Entity>(coll: IQuerySet<A>, param: types.IJoinFunc<T, A>): IQuerySet<T & A> {
		return this.join(coll, param, sql.types.Join.RightJoin);
	}

	outerJoin<A extends model.Entity>(coll: IQuerySet<A>, param: types.IJoinFunc<T, A>): IQuerySet<T & A> {
		return this.join(coll, param, sql.types.Join.OuterJoin);
	}

}

export default IQuerySet;
