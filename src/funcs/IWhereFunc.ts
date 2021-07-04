import { Expression } from '../sql';

interface IWhereFunc<T> {
	(source: T, ...args: any[]): Expression;
}

export default IWhereFunc;
