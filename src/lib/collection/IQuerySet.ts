import * as bean from '../../bean';
import * as sql from '../sql';
import * as funcs from './funcs';

interface IQuerySet<T> {
	getEntity(alias?: string): T;

	// Selection Functions
	list(): Promise<Array<T>>;
	unique(): Promise<T>;

	// Conditional Functions
	where(func?: funcs.IWhereFunc<T> | sql.Expression, ...args: any[]): IQuerySet<T>;
	groupBy(func?: funcs.IArrFieldFunc<T> | sql.Expression | sql.Expression[]): IQuerySet<T>;
	orderBy(func?: funcs.IArrFieldFunc<T> | sql.Expression | sql.Expression[]): IQuerySet<T>;
	limit(size: number, index?: number): IQuerySet<T>;

	mapData(input: bean.ResultSet): Promise<Array<T>>;
}

export default IQuerySet;
