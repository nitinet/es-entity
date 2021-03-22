import { Expression } from '../sql';

interface IWhereFunc<T> {
	(source: T, ...args: any[]): Expression;
}

interface IJoinFunc<A, B> {
	(sourceA: A, sourceB: B): Expression;
}

interface IArrFieldFunc<T> {
	(source: T): Expression | Expression[];
}

interface ISelectFunc<T, U> {
	(source: T): U;
}

interface IUpdateFunc<T> {
	(source: T): T;
}

export { IWhereFunc };
export { IJoinFunc };
export { IArrFieldFunc };
export { ISelectFunc };
export { IUpdateFunc };
