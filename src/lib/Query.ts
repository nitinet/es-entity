import * as aggregation from 'aggregation/es6';

import Handler from './Handler';

abstract class ISqlNode {
	args: Array<any> = new Array<any>();
	abstract eval(handler: Handler): string;
}

/**
 * SqlStatement
 */
class SqlStatement extends ISqlNode {
	command: string = '';
	columns: Array<ISqlNode> = new Array<ISqlNode>();
	values: Array<SqlExpression> = new Array<SqlExpression>();
	collection: SqlCollection = new SqlCollection();
	where: SqlExpression = new SqlExpression();
	groupBy: Array<SqlExpression> = new Array<SqlExpression>();
	orderBy: Array<SqlExpression> = new Array<SqlExpression>();
	limit: SqlExpression = new SqlExpression();

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

abstract class Column {
	_alias: string = '';
	_name: string = '';
	_updated: boolean = false;

	abstract _createExpr(): SqlExpression
	abstract _argExp(operand: any): SqlExpression

	// Comparison Operators
	abstract eq(operand: any): SqlExpression;
	abstract neq(operand: any): SqlExpression;
	abstract lt(operand: any): SqlExpression;
	abstract gt(operand: any): SqlExpression;
	abstract lteq(operand: any): SqlExpression;
	abstract gteq(operand: any): SqlExpression;

	// Logical Operators
	abstract and(operand: Column): SqlExpression;
	abstract or(operand: Column): SqlExpression;
	abstract not(): SqlExpression;

	// Inclusion Funtions
	abstract in(...operand: any[]): SqlExpression;
	abstract between(first: any, second: any): SqlExpression;
	abstract like(operand: any): SqlExpression;
	abstract IsNull(): SqlExpression;
	abstract IsNotNull(): SqlExpression;

	// Arithmatic Operators
	abstract plus(operand: any): SqlExpression;
	abstract minus(operand: any): SqlExpression;
	abstract multiply(operand: any): SqlExpression;
	abstract devide(operand: any): SqlExpression;

	// Sorting Operators
	abstract asc(): SqlExpression;
	abstract desc(): SqlExpression;

	// Group Functions
	abstract sum(): SqlExpression;
	abstract min(): SqlExpression;
	abstract max(): SqlExpression;
	abstract count(): SqlExpression;
	abstract average(): SqlExpression;
}

enum Operator {
	Equal = 1,
	NotEqual,
	LessThan,
	LessThanEqual,
	GreaterThan,
	GreaterThanEqual,
	And,
	Or,
	Not,
	Plus,
	Minus,
	Multiply,
	Devide,
	Between,
	Exists,
	In,
	Like,
	IsNull,
	IsNotNull,
	Asc,
	Desc,
	Limit,
	Comma,
	Count,
	Sum,
	Min,
	Max,
	Avg
}

class Field<T> extends Column {

	// constructor() {
	// 	super();
	// }

	// get() {
	// 	return this;
	// }

	// set(value: T) {
	// 	if (value !== this._value) {
	// 		this._updated = true;
	// 		this._value = value;
	// 	}
	// }

	// toJSON() {
	// 	if (this._value != null) {
	// 		return this._value.valueOf();
	// 	} else {
	// 		return null;
	// 	}
	// }

	_createExpr() {
		let name = this._alias ? this._alias + '.' + this._name : this._name;
		return new SqlExpression(name);
	}

	_argExp(operand: T | Column) {
		let w: SqlExpression = null;
		if (operand instanceof Column) {
			w = (<Column>operand)._createExpr();
		} else {
			w = new SqlExpression('?');
			w.args = w.args.concat(operand);
		}
		return w;
	}

	// Column Interface functions
	// Comparison Operators
	eq(operand: T) {
		return new SqlExpression(null, Operator.Equal, this._createExpr(), this._argExp(operand));
	}
	neq(operand: T) {
		return new SqlExpression(null, Operator.NotEqual, this._createExpr(), this._argExp(operand));
	}
	lt(operand: T) {
		return new SqlExpression(null, Operator.LessThan, this._createExpr(), this._argExp(operand));
	}
	gt(operand: T) {
		return new SqlExpression(null, Operator.GreaterThan, this._createExpr(), this._argExp(operand));
	}
	lteq(operand: T) {
		return new SqlExpression(null, Operator.LessThanEqual, this._createExpr(), this._argExp(operand));
	}
	gteq(operand: T) {
		return new SqlExpression(null, Operator.GreaterThanEqual, this._createExpr(), this._argExp(operand));
	}

	// Logical Operators
	and(operand: Column) {
		return new SqlExpression(null, Operator.And, this._createExpr(), this._argExp(operand));
	}
	or(operand: Column): SqlExpression {
		return new SqlExpression(null, Operator.Or, this._createExpr(), this._argExp(operand));
	}
	not(): SqlExpression {
		return new SqlExpression(null, Operator.Not, this._createExpr());
	}

	// Inclusion Funtions
	in(...operand: T[]) {
		let arg: SqlExpression = new SqlExpression(null, Operator.Comma);
		for (let i = 0; i < operand.length; i++) {
			arg.exps.push(this._argExp(operand[i]));
		}
		return new SqlExpression(null, Operator.In, this._createExpr(), arg);
	}
	between(first: T, second: T) {
		return new SqlExpression(null, Operator.Between, this._createExpr(), this._argExp(first), this._argExp(second));
	}
	like(operand: T) {
		return new SqlExpression(null, Operator.Like, this._createExpr(), this._argExp(operand));
	}
	IsNull() {
		return new SqlExpression(null, Operator.IsNull, this._createExpr());
	}
	IsNotNull() {
		return new SqlExpression(null, Operator.IsNotNull, this._createExpr());
	}

	// Arithmatic Operators
	plus(operand: T) {
		return new SqlExpression(null, Operator.Plus, this._createExpr(), this._argExp(operand));
	}
	minus(operand: T) {
		return new SqlExpression(null, Operator.Minus, this._createExpr(), this._argExp(operand));
	}
	multiply(operand: T) {
		return new SqlExpression(null, Operator.Multiply, this._createExpr(), this._argExp(operand));
	}
	devide(operand: T) {
		return new SqlExpression(null, Operator.Devide, this._createExpr(), this._argExp(operand));
	}

	// Sorting Operators
	asc() {
		return new SqlExpression(null, Operator.Asc, this._createExpr());
	}
	desc() {
		return new SqlExpression(null, Operator.Desc, this._createExpr());
	}

	// Group Functions
	sum() {
		return new SqlExpression(null, Operator.Sum, this._createExpr());
	}
	min() {
		return new SqlExpression(null, Operator.Min, this._createExpr());
	}
	max() {
		return new SqlExpression(null, Operator.Max, this._createExpr());
	}
	count() {
		return new SqlExpression(null, Operator.Count, this._createExpr());
	}
	average() {
		return new SqlExpression(null, Operator.Avg, this._createExpr());
	}

}

/**
 * SqlExpression
 */
class SqlExpression extends aggregation(ISqlNode, Field) {
	args: Array<any> = new Array<any>();

	_alias: string = '';
	_name: string = '';
	_updated: boolean = false;

	value: string = null;
	exps: Array<SqlExpression> = null;
	operator: Operator = null;

	constructor(value?: string, operator?: Operator, ...expressions: Array<SqlExpression>) {
		super()
		this.value = value;
		this.exps = expressions;
		this.operator = operator;
	}

	add(...expressions: Array<SqlExpression>): SqlExpression {
		if (this.operator == Operator.And) {
			this.exps = this.exps.concat(expressions);
			return this;
		} else if (!this.operator && this.exps.length == 0) {
			let exp = expressions.pop();
			for (var i = 0; i < expressions.length; i++) {
				exp.add(expressions[i]);
			}
			return exp;
		} else {
			let exp: SqlExpression = new SqlExpression(null, Operator.And, this);
			for (var i = 0; i < expressions.length; i++) {
				exp.add(expressions[i]);
			}
			return exp;
		}
	}

	eval(handler: Handler): string {
		if (this.value) {
			return this.value;
		} else if (this.exps) {
			let values: Array<string> = new Array<string>();
			for (let i = 0; i < this.exps.length; i++) {
				values[i] = this.exps[i].eval(handler);
				this.args = this.args.concat(this.exps[i].args);
			}

			if (!this.operator && this.exps.length > 1) {
				this.operator = Operator.And;
			}

			let val0: string = values[0] = values[0] ? values[0] : '';
			let val1: string = values[1] = values[1] ? values[1] : '';

			let r: string = '';
			switch (this.operator) {
				case Operator.Equal:
					r = handler.eq(val0, val1);
					break;
				case Operator.NotEqual:
					r = handler.neq(val0, val1);
					break;
				case Operator.LessThan:
					r = handler.lt(val0, val1);
					break;
				case Operator.LessThanEqual:
					r = handler.lteq(val0, val1);
					break;
				case Operator.GreaterThan:
					r = handler.gt(val0, val1);
					break;
				case Operator.GreaterThanEqual:
					r = handler.gteq(val0, val1);
					break;
				case Operator.And:
					r = handler.and(values);
					break;
				case Operator.Or:
					r = handler.or(values);
					break;
				case Operator.Not:
					r = handler.not(val0);
					break;
				case Operator.Plus:
					r = handler.plus(val0, val1);
					break;
				case Operator.Minus:
					r = handler.minus(val0, val1);
					break;
				case Operator.Multiply:
					r = handler.multiply(val0, val1);
					break;
				case Operator.Devide:
					r = handler.devide(val0, val1);
					break;
				case Operator.Between:
					r = handler.between(values);
					break;
				case Operator.Exists:
					r = handler.exists(val0);
					break;
				case Operator.In:
					r = handler.in(val0, val1);
					break;
				case Operator.Like:
					r = handler.like(val0, val1);
					break;
				case Operator.IsNull:
					r = handler.isNull(val0);;
					break;
				case Operator.IsNotNull:
					r = handler.isNotNull(val0);
					break;
				case Operator.Asc:
					r = handler.asc(val0);
					break;
				case Operator.Desc:
					r = handler.desc(val0);
					break;
				case Operator.Limit: {
					r = handler.limit(val0, val1);
				}
					break;
				case Operator.Comma: {
					for (let i = 0; i < values.length; i++)
						r = r.concat(values[i], ', ');
					r = r.slice(0, r.length - 2);
				}
					break;
				case Operator.Count:
					r = handler.count(val0);
					break;
				case Operator.Sum:
					r = handler.sum(val0);
					break;
				case Operator.Min:
					r = handler.min(val0);
					break;
				case Operator.Max:
					r = handler.max(val0);
					break;
				case Operator.Avg:
					r = handler.average(val0);
					break;

				default:
					break;
			}
			return r;
		}
	}

	_createExpr(): SqlExpression {
		return this;
	}

}

export { ISqlNode };
export { SqlStatement };
export { SqlCollection };
export { Column };
export { Operator };
export { Field };
export { SqlExpression };
