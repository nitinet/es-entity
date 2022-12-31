import Expression from '../sql/Expression.js';
import Entity from './Entity.js';

interface IArrFieldFunc<T> {
	(source: T): Expression[];
}

interface IJoinFunc<A, B> {
	(sourceA: A, sourceB: B): Expression;
}

interface IUpdateFunc<T> {
	(source: T): T;
}

interface IWhereFunc<T> {
	(source: T, ...args: any[]): Expression;
}

interface IEntityType<T extends Object> {
	new(): T;
}

type SelectType<T> = {
	[Property in keyof T]?: any;
};

type PropKeys<T> = Exclude<keyof T, "addChangeProp" | "clearChangeProps" | "getChangeProps">

type SubEntityType<T> = Partial<T> & Entity;

export {
	IArrFieldFunc,
	IEntityType,
	IJoinFunc,
	IUpdateFunc,
	IWhereFunc,
	PropKeys,
	SelectType,
	SubEntityType
}
