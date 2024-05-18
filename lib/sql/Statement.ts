import Handler from '../handlers/Handler.js';
import Collection from './Collection.js';
import Expression from './Expression.js';
import INode from './INode.js';
import Command from './types/Command.js';

/**
 * SqlStatement
 */
class Statement extends INode {
  command: Command | null = null;
  columns: Array<INode> = new Array<INode>();
  values: Array<Expression> = new Array<Expression>();
  collection: Collection = new Collection();
  where: Expression = new Expression();
  groupBy: Array<Expression> = new Array<Expression>();
  orderBy: Array<Expression> = new Array<Expression>();
  limit: Expression = new Expression();

  eval(handler: Handler): string {
    let result: string;
    switch (this.command) {
      case Command.SELECT:
        result = this.selectQuery(handler);
        break;
      case Command.INSERT:
        result = this.insertQuery(handler);
        break;
      case Command.UPDATE:
        result = this.updateQuery(handler);
        break;
      case Command.DELETE:
        result = this.deleteQuery(handler);
        break;
      default:
        throw new Error('Invalid Statement');
    }
    return result;
  }

  insertQuery(handler: Handler) {
    let collectionStr = this.getCollectionStr(handler);
    let columnStr = this.getColumnStr(handler);
    let valueStr = this.getValueStr(handler);

    return `insert into ${collectionStr} (${columnStr}) values (${valueStr})`;
  }

  selectQuery(handler: Handler) {
    let collectionStr = this.getCollectionStr(handler);
    let columnStr = this.getColumnStr(handler);
    let whereStr = this.getWhereStr(handler);
    let groupByStr = this.getGroupByStr(handler);
    let orderByStr = this.getOrderByStr(handler);
    let limitStr = this.getLimitStr(handler);

    return `select ${columnStr} from ${collectionStr}${whereStr}${groupByStr}${orderByStr}${limitStr}`;
  }

  updateQuery(handler: Handler) {
    let collectionStr = this.getCollectionStr(handler);
    let columnStr = this.getColumnStr(handler);
    let whereStr = this.getWhereStr(handler);

    return `update ${collectionStr} set ${columnStr}${whereStr}`;
  }

  deleteQuery(handler: Handler) {
    let collectionStr = this.getCollectionStr(handler);
    let whereStr = this.getWhereStr(handler);

    return `delete from ${collectionStr}${whereStr}`;
  }

  // Collection
  getCollectionStr(handler: Handler) {
    let collectionStr: string = this.collection.eval(handler);
    this.args = this.args.concat(this.collection.args);
    return collectionStr;
  }

  // Column
  getColumnStr(handler: Handler) {
    return this.columns
      .map(ele => {
        let r = ele.eval(handler);
        this.args = this.args.concat(ele.args);
        return r;
      }, this)
      .join(', ');
  }

  // Where
  getWhereStr(handler: Handler) {
    let whereStr: string = this.where.eval(handler);
    this.args = this.args.concat(this.where.args);
    return whereStr ? ` where ${whereStr}` : '';
  }

  // Values
  getValueStr(handler: Handler) {
    return this.values
      .map(ele => {
        let r = ele.eval(handler);
        this.args = this.args.concat(ele.args);
        return r;
      }, this)
      .join(', ');
  }

  // Group By
  getGroupByStr(handler: Handler) {
    let groupByStr = this.groupBy
      .map(ele => {
        let r = ele.eval(handler);
        this.args = this.args.concat(ele.args);
        return r;
      }, this)
      .join(', ');
    return groupByStr ? ` group by ${groupByStr}` : '';
  }

  // Order By
  getOrderByStr(handler: Handler) {
    let orderByStr = this.orderBy
      .map(ele => {
        let r = ele.eval(handler);
        this.args = this.args.concat(ele.args);
        return r;
      }, this)
      .join(', ');
    return orderByStr ? ` order by ${orderByStr}` : '';
  }

  // Limit
  getLimitStr(handler: Handler) {
    let limitStr: string = this.limit.eval(handler);
    this.args = this.args.concat(this.limit.args);
    return limitStr;
  }
}

export default Statement;
