import { Expression } from '../sql';

interface IWhereFunc<T> {
	(source: T, ...args: any[]): Expression;
}

interface IJoinFunc<A, B> {
	(sourceA: A, sourceB: B): Expression;
}

interface IArrFieldFunc<T> {
	(...source: T[]): Expression | Expression[];
}

interface IForeignFunc<T> {
	(source: T, parent: any): Expression;
}

export { IWhereFunc };
export { IJoinFunc };
export { IArrFieldFunc };
export { IForeignFunc };
