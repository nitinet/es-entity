import { Expression } from '../sql';

interface IArrFieldFunc<T> {
	(source: T): Expression | Expression[];
}

export default IArrFieldFunc;
