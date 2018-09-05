import * as bean from '../../bean';
import * as sql from '../sql';
import * as funcs from './funcs';
import IQuerySet from './IQuerySet';
import DBSet from './DBSet';
declare class QuerySet<T extends Object> implements IQuerySet<T> {
    private dbSet;
    private stat;
    constructor(stat: sql.SqlStatement, dbSet: DBSet<T>);
    getEntity(alias?: string): T;
    list(): Promise<T[]>;
    select(func?: funcs.IArrFieldFunc<T>): Promise<T[]>;
    unique(): Promise<T>;
    where(param?: funcs.IWhereFunc<T> | sql.SqlExpression, ...args: any[]): IQuerySet<T>;
    groupBy(param?: funcs.IArrFieldFunc<T> | sql.SqlExpression[]): IQuerySet<T>;
    orderBy(param?: funcs.IArrFieldFunc<T> | sql.SqlExpression[]): IQuerySet<T>;
    limit(size: number, index?: number): IQuerySet<T>;
    mapData(input: bean.ResultSet): Promise<Array<T>>;
}
export default QuerySet;
