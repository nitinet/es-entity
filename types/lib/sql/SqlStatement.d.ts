import Handler from '../Handler';
import ISqlNode from './ISqlNode';
import SqlExpression from './SqlExpression';
import SqlCollection from './SqlCollection';
declare class SqlStatement extends ISqlNode {
    command: string;
    columns: Array<ISqlNode>;
    values: Array<SqlExpression>;
    collection: SqlCollection;
    where: SqlExpression;
    groupBy: Array<SqlExpression>;
    orderBy: Array<SqlExpression>;
    limit: SqlExpression;
    constructor();
    eval(handler: Handler): string;
}
export default SqlStatement;
