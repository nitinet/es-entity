import { Expression } from '../sql';

interface IJoinFunc<A, B> {
	(sourceA: A, sourceB: B): Expression;
}

export default IJoinFunc;
