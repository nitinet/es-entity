import Handler from '../handlers/Handler.js';
import INode from './INode.js';
import Statement from './Statement.js';
import Join from './types/Join.js';

/**
 * SqlCollection
 * Used for tables and columns
 */
class Collection extends INode {
  colAlias: string | null = null;
  value: string | null = null;

  stat: Statement | null = null;

  leftColl: Collection | null = null;
  rightColl: Collection | null = null;
  join: Join | null = null;

  alias: string | null = null;

  eval(handler: Handler): string {
    let res: string = '';
    if (this.value) {
      res = this.colAlias ? `${this.colAlias}.${this.value}` : this.value;
    } else if (this.stat) {
      this.args = this.args.concat(this.stat.args);
      res = `(${this.stat.eval(handler)})`;
    } else if (this.leftColl && this.rightColl && this.join) {
      let val0: string = this.leftColl.eval(handler);
      let val1: string = this.rightColl.eval(handler);

      switch (this.join) {
        case Join.InnerJoin:
          res = `(${val0} inner join ${val1})`;
          break;
        case Join.LeftJoin:
          res = `(${val0} left join ${val1})`;
          break;
        case Join.RightJoin:
          res = `(${val0} right join ${val1})`;
          break;
        case Join.OuterJoin:
          res = `(${val0} outer join ${val1})`;
          break;
        default:
          break;
      }
    }
    if (!res) {
      throw new Error('No Collection Found');
    }
    if (this.alias) {
      res = `${res} as ${this.alias}`;
    }
    return res;
  }
}

export default Collection;
