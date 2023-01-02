import Expression from '../sql/Expression.js';

interface IArrFieldFunc<T> {
	(source: T): Expression[];
}

interface IJoinFunc<A, B> {
	(sourceA: A, sourceB: B): Expression;
}

interface IUpdateFunc<T> {
	(source: T): { obj: T, updatedKeys: (keyof T)[] };
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

// type PropKeys<T> = Exclude<keyof T, "addChangeProps" | "clearChangeProps" | "isPropChanged">
type PropKeys<T extends Object> = keyof T;

// type SubEntityType<T> = Partial<T> & Entity;
type SubEntityType<T> = Partial<T> & Object;

type OpderType = 'ASC' | 'DESC';

export {
	IArrFieldFunc,
	IEntityType,
	IJoinFunc,
	IUpdateFunc,
	IWhereFunc,
	PropKeys,
	SelectType,
	SubEntityType,
	OpderType
}
