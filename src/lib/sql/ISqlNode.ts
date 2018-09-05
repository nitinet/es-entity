import Handler from '../Handler';

abstract class ISqlNode {
	args: Array<any> = new Array<any>();
	abstract eval(handler: Handler): string;
}

export default ISqlNode;
