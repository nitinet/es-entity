import Handler from '../Handler';
import INode from './INode';
import Statement from './Statement';

/**
 * SqlCollection
 * Used for tables and columns
 */
class Collection extends INode {
	colAlias: string = null;
	value: string = null;
	stat: Statement = null;
	alias: string = null;

	constructor() {
		super()
	}

	eval(handler: Handler): string {
		let result: string = null;
		if (this.value) {
			result = this.colAlias ? this.colAlias + '.' + this.value : this.value;
		} else if (this.stat) {
			this.args = this.args.concat(this.stat.args);
			result = '(' + this.stat.eval(handler) + ')';
		}
		if (!result) {
			throw 'No Collection Found';
		}
		if (this.alias) {
			result = result.concat(' as ', this.alias);
		}
		return result;
	}
}

export default Collection;
