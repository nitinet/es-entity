import Handler from '../Handler';
import INode from './INode';
import Expression from './Expression';
import Collection from './Collection';
declare class Statement extends INode {
    command: string;
    columns: Array<INode>;
    values: Array<Expression>;
    collection: Collection;
    where: Expression;
    groupBy: Array<Expression>;
    orderBy: Array<Expression>;
    limit: Expression;
    constructor();
    eval(handler: Handler): string;
}
export default Statement;
