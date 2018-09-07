import * as bean from '../../bean';
import * as sql from '../sql';
import * as types from '../types';
import Context from '../Context';
import IQuerySet from './IQuerySet';
import * as funcs from './funcs';
declare class ForeignSet<T extends Object> implements IQuerySet<T> {
    private entityType;
    private foreignFunc;
    private context;
    private dbSet;
    constructor(entityType: types.IEntityType<T>, foreignFunc: funcs.IForeignFunc<T>);
    setup(context: Context, parent: any): void;
    getEntity(alias?: string): T;
    list(): Promise<T[]>;
    unique(): Promise<T>;
    where(func?: funcs.IWhereFunc<T> | sql.Expression, ...args: any[]): IQuerySet<T>;
    groupBy(func?: funcs.IArrFieldFunc<T> | sql.Expression | sql.Expression[]): IQuerySet<T>;
    orderBy(func?: funcs.IArrFieldFunc<T> | sql.Expression | sql.Expression[]): any;
    limit(size: number, index?: number): any;
    mapData(input: bean.ResultSet): Promise<T[]>;
}
export default ForeignSet;
