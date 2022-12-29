import Expression from '../sql/Expression.js';

interface IWhereFunc<T> {
	(source: T, ...args: any[]): Expression;
}

export default IWhereFunc;
