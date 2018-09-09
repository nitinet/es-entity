import Handler from '../Handler';
import INode from './INode';
import Statement from './Statement';
declare class Collection extends INode {
    colAlias: string;
    value: string;
    stat: Statement;
    alias: string;
    constructor();
    eval(handler: Handler): string;
}
export default Collection;
