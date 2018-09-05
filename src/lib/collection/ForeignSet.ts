import * as bean from '../../bean';
import * as sql from '../sql';
import * as types from '../types';
import Context from '../Context';
import IQuerySet from './IQuerySet';
import * as funcs from './funcs';

class ForeignSet<T extends Object> implements IQuerySet<T>{
	private entityType: types.IEntityType<T>;
	private foreignFunc: funcs.IForeignFunc<T> = null;
	private context: Context = null;
	private dbSet: IQuerySet<T> = null;

	constructor(entityType: types.IEntityType<T>, foreignFunc: funcs.IForeignFunc<T>) {
		this.entityType = entityType;
		this.foreignFunc = foreignFunc;
	}

	setup(context: Context, parent) {
		this.context = context;
		this.dbSet = this.context.dbSetMap.get(this.entityType).where(this.foreignFunc, parent);
	}

	getEntity(alias?: string) {
		return this.dbSet.getEntity(alias);
	}

	// Selection Functions
	list() {
		return this.dbSet.list();
	}

	unique() {
		return this.dbSet.unique();
	}

	// Conditional Functions
	where(func?: funcs.IWhereFunc<T> | sql.SqlExpression, ...args: any[]) {
		return this.dbSet.where(func, args);
	}

	groupBy(func?: funcs.IArrFieldFunc<T> | sql.SqlExpression | sql.SqlExpression[]) {
		return this.dbSet.groupBy(func);
	}

	orderBy(func?: funcs.IArrFieldFunc<T> | sql.SqlExpression | sql.SqlExpression[]) {
		return this.orderBy(func);
	}

	limit(size: number, index?: number) {
		return this.limit(size, index);
	}

	mapData(input: bean.ResultSet) {
		return this.dbSet.mapData(input);
	}

}

export default ForeignSet;
