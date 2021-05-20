import Handler from '../handlers/Handler';
import INode from './INode';
import Statement from './Statement';
import Join from './types/Join';

/**
 * SqlCollection
 * Used for tables and columns
 */
class Collection extends INode {
	colAlias: string = null;
	value: string = null;

	stat: Statement = null;

	leftColl: Collection = null;
	rightColl: Collection = null;
	join: Join = null;

	alias: string = null;

	constructor() {
		super()
	}

	eval(handler: Handler): string {
		let res: string = null;
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
			throw 'No Collection Found';
		}
		if (this.alias) {
			res = `${res} as ${this.alias}`;
		}
		return res;
	}
}

export default Collection;
