import Handler from '../handlers/Handler';

abstract class INode {
	args: Array<any> = new Array<any>();
	abstract eval(handler: Handler): string;
}

export default INode;
