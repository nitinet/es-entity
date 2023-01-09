import Expression from '../sql/Expression.js';
import Operator from '../sql/types/Operator.js';
import BaseExprBuilder from './BaseExprBuilder.js';
import FieldMapping from './FieldMapping.js';
import { PropKeys } from './types.js';

type ValueType = boolean | string | number | Date | Buffer;
type OperandType = ValueType | Expression;

class WhereExprBuilder<T extends Object> extends BaseExprBuilder<T> {

	constructor(fieldMap: Map<string | symbol, FieldMapping>, alias?: string) {
		super(fieldMap, alias);
	}

	private _argExp(operand: OperandType) {
		let res: Expression = null;
		if (operand instanceof Expression) {
			res = operand;
		} else {
			res = new Expression('?');
			res.args = res.args.concat(operand);
		}
		return res;
	}

	// Comparison Operators
	eq(propName: PropKeys<T>, operand: OperandType) {
		return new Expression(null, Operator.Equal, this._expr(propName), this._argExp(operand));
	}
	neq(propName: PropKeys<T>, operand: OperandType) {
		return new Expression(null, Operator.NotEqual, this._expr(propName), this._argExp(operand));
	}
	lt(propName: PropKeys<T>, operand: OperandType) {
		return new Expression(null, Operator.LessThan, this._expr(propName), this._argExp(operand));
	}
	gt(propName: PropKeys<T>, operand: OperandType) {
		return new Expression(null, Operator.GreaterThan, this._expr(propName), this._argExp(operand));
	}
	lteq(propName: PropKeys<T>, operand: OperandType) {
		return new Expression(null, Operator.LessThanEqual, this._expr(propName), this._argExp(operand));
	}
	gteq(propName: PropKeys<T>, operand: OperandType) {
		return new Expression(null, Operator.GreaterThanEqual, this._expr(propName), this._argExp(operand));
	}

	// Logical Operators
	and(propName: PropKeys<T>, operand: Expression) {
		return new Expression(null, Operator.And, this._expr(propName), this._argExp(operand));
	}
	or(propName: PropKeys<T>, operand: Expression): Expression {
		return new Expression(null, Operator.Or, this._expr(propName), this._argExp(operand));
	}
	not(propName: PropKeys<T>): Expression {
		return new Expression(null, Operator.Not, this._expr(propName));
	}

	// Inclusion Funtions
	in(propName: PropKeys<T>, ...operand: ValueType[]) {
		let vals = operand.map(val => {
			let arg = new Expression('?');
			arg.args = arg.args.concat(val);
			return arg;
		});
		return new Expression(null, Operator.In, this._expr(propName), ...vals);
	}

	between(propName: PropKeys<T>, first: OperandType, second: OperandType) {
		return new Expression(null, Operator.Between, this._expr(propName), this._argExp(first), this._argExp(second));
	}

	like(propName: PropKeys<T>, operand: string) {
		return new Expression(null, Operator.Like, this._expr(propName), this._argExp(operand));
	}

	// Null Checks
	IsNull(propName: PropKeys<T>) {
		return new Expression(null, Operator.IsNull, this._expr(propName));
	}
	IsNotNull(propName: PropKeys<T>) {
		return new Expression(null, Operator.IsNotNull, this._expr(propName));
	}

	// Arithmatic Operators
	plus(propName: PropKeys<T>, operand: OperandType) {
		return new Expression(null, Operator.Plus, this._expr(propName), this._argExp(operand));
	}
	minus(propName: PropKeys<T>, operand: OperandType) {
		return new Expression(null, Operator.Minus, this._expr(propName), this._argExp(operand));
	}
	multiply(propName: PropKeys<T>, operand: OperandType) {
		return new Expression(null, Operator.Multiply, this._expr(propName), this._argExp(operand));
	}
	devide(propName: PropKeys<T>, operand: OperandType) {
		return new Expression(null, Operator.Devide, this._expr(propName), this._argExp(operand));
	}

	// Group Functions
	sum(propName: PropKeys<T>) {
		return new Expression(null, Operator.Sum, this._expr(propName));
	}
	min(propName: PropKeys<T>) {
		return new Expression(null, Operator.Min, this._expr(propName));
	}
	max(propName: PropKeys<T>) {
		return new Expression(null, Operator.Max, this._expr(propName));
	}
	count(propName: PropKeys<T>) {
		return new Expression(null, Operator.Count, this._expr(propName));
	}
	average(propName: PropKeys<T>) {
		return new Expression(null, Operator.Avg, this._expr(propName));
	}

}

export default WhereExprBuilder;
