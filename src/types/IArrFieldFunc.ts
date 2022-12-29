import Expression from '../sql/Expression.js';

interface IArrFieldFunc<T> {
	(source: T): Expression | Expression[];
}

export default IArrFieldFunc;
