import Handler from '../Handler';
declare abstract class ISqlNode {
    args: Array<any>;
    abstract eval(handler: Handler): string;
}
export default ISqlNode;
