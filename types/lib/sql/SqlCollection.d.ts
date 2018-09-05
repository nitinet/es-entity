import Handler from '../Handler';
import ISqlNode from './ISqlNode';
import SqlStatement from './SqlStatement';
declare class SqlCollection extends ISqlNode {
    colAlias: string;
    value: string;
    stat: SqlStatement;
    alias: string;
    constructor();
    eval(handler: Handler): string;
}
export default SqlCollection;
