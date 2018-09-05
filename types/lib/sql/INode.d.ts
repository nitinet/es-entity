import Handler from '../Handler';
declare abstract class INode {
    args: Array<any>;
    abstract eval(handler: Handler): string;
}
export default INode;
