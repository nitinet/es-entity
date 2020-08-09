import Handler from '../Handler';
import INode from './INode';
import Command from './Command';
import Expression from './Expression';
import Collection from './Collection';
/**
 * SqlStatement
 */
class Statement extends INode {
	command: Command = null;
	columns: Array<INode> = new Array<INode>();
	values: Array<Expression> = new Array<Expression>();
	collection: Collection = new Collection();
	where: Expression = new Expression();
	groupBy: Array<Expression> = new Array<Expression>();
	orderBy: Array<Expression> = new Array<Expression>();
	limit: Expression = new Expression();

	constructor() {
		super();
	}

	eval(handler: Handler): string {
		if (!handler) {
			throw 'No Handler Found';
		}

		let result: string = null;
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
				break;
		}

		result = handler.convertPlaceHolder(result);
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
		let columnStr = this.columns.map(ele => {
			let r = ele.eval(handler);
			this.args = this.args.concat(ele.args);
			return r;
		}, this).join(', ');
		return columnStr;
	}

	// Where
	getWhereStr(handler: Handler) {
		let whereStr: string = this.where.eval(handler);
		this.args = this.args.concat(this.where.args);
		return whereStr ? ` where ${whereStr}` : '';
	}

	// Values
	getValueStr(handler: Handler) {
		let valueStr = this.values.map(ele => {
			let r = ele.eval(handler);
			this.args = this.args.concat(ele.args);
			return r;
		}, this).join(', ');
		return valueStr;
	}

	// Group By
	getGroupByStr(handler: Handler) {
		let groupByStr = this.groupBy.map(ele => {
			let r = ele.eval(handler);
			this.args = this.args.concat(ele.args);
			return r;
		}, this).join(', ');
		return groupByStr ? ` group by ${groupByStr}` : '';
	}

	// Order By
	getOrderByStr(handler: Handler) {
		let orderByStr = this.orderBy.map(ele => {
			let r = ele.eval(handler);
			this.args = this.args.concat(ele.args);
			return r;
		}, this).join(', ');
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
