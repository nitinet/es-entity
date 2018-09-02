import * as bean from '../bean/index';
import Context from './Context';
import * as Type from './Type';
import * as Mapping from './Mapping';
import * as Query from './Query';
interface whereFunc<T> {
    (source: T, ...args: any[]): Query.SqlExpression;
}
interface arrFieldFunc<T> {
    (source: T): Query.SqlExpression | Query.SqlExpression[];
}
export default interface Queryable<T> {
    getEntity(alias?: string): T;
    insert(entity: T): Promise<T>;
    update(entity: T): Promise<T>;
    insertOrUpdate(entity: T): any;
    delete(entity: T): Promise<void>;
    list(): Promise<Array<T>>;
    unique(): Promise<T>;
    where(func?: whereFunc<T> | Query.SqlExpression, ...args: any[]): Queryable<T>;
    groupBy(func?: arrFieldFunc<T> | Query.SqlExpression | Query.SqlExpression[]): Queryable<T>;
    orderBy(func?: arrFieldFunc<T> | Query.SqlExpression | Query.SqlExpression[]): Queryable<T>;
    limit(size: number, index?: number): Queryable<T>;
    mapData(input: bean.ResultSet): Promise<Array<T>>;
}
export declare class DBSet<T extends Object> implements Queryable<T> {
    entityType: Type.IEntityType<T>;
    entityName: string;
    entityPath: string;
    context: Context;
    mapping: Mapping.EntityMapping;
    constructor(entityType: Type.IEntityType<T>, entityName?: string, entityPath?: string);
    bind(context: Context): Promise<void>;
    getEntity(alias?: string): T;
    isUpdated(obj: any, key: string): boolean;
    setValue(obj: any, key: string, value: any): void;
    getValue(obj: any, key: string): Query.Field<any>;
    executeStatement(stat: Query.SqlStatement): Promise<bean.ResultSet>;
    insert(entity: T): Promise<T>;
    update(entity: T): Promise<T>;
    insertOrUpdate(entity: T): Promise<T>;
    delete(entity: T): Promise<void>;
    get(id: any): Promise<T>;
    where(param?: whereFunc<T> | Query.SqlExpression, ...args: any[]): Queryable<T>;
    groupBy(func?: arrFieldFunc<T> | Query.SqlExpression[]): Queryable<T>;
    orderBy(func?: arrFieldFunc<T> | Query.SqlExpression[]): Queryable<T>;
    limit(size: number, index?: number): Queryable<T>;
    list(): Promise<Array<T>>;
    unique(): Promise<T>;
    mapData(input: bean.ResultSet): Promise<Array<T>>;
}
export {};
