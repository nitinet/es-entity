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

type PropKeys<T> = keyof T;

type OperandType<T, K extends PropKeys<T>> = T[K] | Expression;

type SubEntityType<T> = Partial<T> & Object;

export {
	IArrFieldFunc,
	IEntityType,
	IJoinFunc,
	IUpdateFunc,
	IWhereFunc,
	PropKeys,
	OperandType,
	SelectType,
	SubEntityType
}
