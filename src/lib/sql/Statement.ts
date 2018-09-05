import Handler from '../Handler';
import INode from './INode';
import Expression from './Expression';
import Collection from './Collection';
/**
 * SqlStatement
 */
class Statement extends INode {
	command: string = '';
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
		let result: string = '';

		// Column
		let columnStr: string = '';
		for (let i = 0; i < this.columns.length; i++) {
			let element = this.columns[i];
			let val = element.eval(handler);
			if (i == 0)
				columnStr = columnStr.concat(' ' + val);
			else
				columnStr = columnStr.concat(', ' + val);
			this.args = this.args.concat(element.args);
		}

		// Collection
		let collectionStr: string = this.collection.eval(handler);
		this.args = this.args.concat(this.collection.args);

		// Where
		let whereStr: string = this.where.eval(handler);
		this.args = this.args.concat(this.where.args);

		// Group By
		let groupByStr: string = '';
		for (let i = 0; i < this.groupBy.length; i++) {
			let element = this.groupBy[i];
			let val = element.eval(handler);
			if (i == 0)
				groupByStr = groupByStr.concat(' ' + val);
			else
				groupByStr = groupByStr.concat(', ' + val);
			this.args = this.args.concat(element.args);
		}

		// Order By
		let orderByStr: string = '';
		for (let i = 0; i < this.orderBy.length; i++) {
			let element = this.orderBy[i];
			let val = element.eval(handler);
			if (i == 0)
				orderByStr = orderByStr.concat(' ' + val);
			else
				orderByStr = orderByStr.concat(', ' + val);
			this.args = this.args.concat(element.args);
		}

		// Where
		let limitStr: string = this.limit.eval(handler);
		this.args = this.args.concat(this.limit.args);

		// Values
		let valueStr: string = '';
		for (let i = 0; i < this.values.length; i++) {
			let element = this.values[i];
			let val = element.eval(handler);
			if (i == 0)
				valueStr = valueStr.concat(' ' + val);
			else
				valueStr = valueStr.concat(', ' + val);
			this.args = this.args.concat(element.args);
		}

		this.command = this.command.toLowerCase();
		if (this.command === 'insert') {
			result = result.concat(handler.insertQuery(collectionStr, columnStr, valueStr));
		} else if (this.command == 'select') {
			result = result.concat(handler.selectQuery(collectionStr, columnStr));
			if (whereStr)
				result = result.concat(handler.whereQuery(whereStr));
			if (groupByStr)
				result = result.concat(handler.groupQuery(groupByStr));
			if (orderByStr)
				result = result.concat(handler.orderQuery(orderByStr));
			if (limitStr)
				result = result.concat(limitStr);
		} else if (this.command === 'update') {
			result = result.concat(handler.updateQuery(collectionStr, columnStr, whereStr));
		} else if (this.command === 'delete') {
			result = result.concat(handler.deleteQuery(collectionStr, whereStr));
		}
		result = handler.convertPlaceHolder(result);
		return result;
	}
}

export default Statement;
