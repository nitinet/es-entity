import Handler from '../Handler';
import ISqlNode from './ISqlNode';
import SqlStatement from './SqlStatement';

/**
 * SqlCollection
 * Used for tables and columns
 */
class SqlCollection extends ISqlNode {
	colAlias: string = null;
	value: string = null;
	stat: SqlStatement = null;
	alias: string = null;

	constructor() {
		super()
	}

	eval(handler: Handler): string {
		let result: string = '';
		if (this.value)
			result = this.colAlias ? this.colAlias + '.' + this.value : this.value;
		else if (this.stat) {
			this.args = this.args.concat(this.stat.args);
			result = '(' + this.stat.eval(handler) + ')';
		}
		if (!result) {
			throw 'No Collection Found';
		}
		if (this.alias)
			result = result.concat(' as ', this.alias);
		return result;
	}
}

export default SqlCollection;
