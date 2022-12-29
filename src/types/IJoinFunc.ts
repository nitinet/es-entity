import Expression from '../sql/Expression.js';

interface IJoinFunc<A, B> {
	(sourceA: A, sourceB: B): Expression;
}

export default IJoinFunc;
