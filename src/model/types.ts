import Expression from '../sql/Expression.js';

type IArrFieldFunc<T> = (source: T) => Expression[];

type IJoinFunc<A, B> = (sourceA: A, sourceB: B) => Expression | null;

type IUpdateFunc<T> = (source: T) => { obj: T, updatedKeys: (keyof T)[] };

type IWhereFunc<T> = (source: T, ...args: any[]) => Expression | null;

type IEntityType<T extends Object> = new (...args: any[]) => T;

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
