import Context from '../Context.js';
import * as model from '../model/index.js';
import * as types from '../model/types.js';
import * as sql from '../sql/index.js';
import DBSet from './DBSet.js';

abstract class IQuerySet<T extends Object> {
	context!: Context;

	protected EntityType!: types.IEntityType<T>;
	dbSet!: DBSet;

	// Selection Functions
	abstract list(): Promise<T[]>;
	abstract listPlain(keys: (keyof T)[]): Promise<Partial<T>[]>;

	async single(): Promise<T | null> {
		let arr = await this.list();
		if (arr.length > 1) throw new Error('More than one row found in unique call');
		else if (arr.length == 0) return null;
		else return arr[0];
	}

	async singleOrThrow(): Promise<T> {
		let val = await this.single();
		if (!val) throw new Error('Value Not Found');
		return val;
	}

	abstract select<U extends Object>(TargetType: types.IEntityType<U>): IQuerySet<U>;

	abstract where(func: types.IWhereFunc<model.WhereExprBuilder<T>>, ...args: any[]): IQuerySet<T>;
	abstract orderBy(func: types.IArrFieldFunc<model.OrderExprBuilder<T>>): IQuerySet<T>;
	abstract limit(size: number, index?: number): IQuerySet<T>;

	abstract groupBy(func: types.IArrFieldFunc<model.GroupExprBuilder<T>>): IQuerySet<T>;

	// abstract join<A extends Object>(collection: IQuerySet<A>, func: types.IJoinFunc<model.WhereExprBuilder<T>, model.GroupExprBuilder<A>>, joinType?: sql.types.Join): IQuerySet<T & A>;

	// innerJoin<A extends Object>(coll: IQuerySet<A>, param: types.IJoinFunc<model.WhereExprBuilder<T>, model.GroupExprBuilder<A>>): IQuerySet<T & A> {
	// 	return this.join(coll, param, sql.types.Join.InnerJoin);
	// }

	// leftJoin<A extends Object>(coll: IQuerySet<A>, param: types.IJoinFunc<model.WhereExprBuilder<T>, model.GroupExprBuilder<A>>): IQuerySet<T & A> {
	// 	return this.join(coll, param, sql.types.Join.LeftJoin);
	// }

	// rightJoin<A extends Object>(coll: IQuerySet<A>, param: types.IJoinFunc<model.WhereExprBuilder<T>, model.GroupExprBuilder<A>>): IQuerySet<T & A> {
	// 	return this.join(coll, param, sql.types.Join.RightJoin);
	// }

	// outerJoin<A extends Object>(coll: IQuerySet<A>, param: types.IJoinFunc<model.WhereExprBuilder<T>, model.GroupExprBuilder<A>>): IQuerySet<T & A> {
	// 	return this.join(coll, param, sql.types.Join.OuterJoin);
	// }

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
