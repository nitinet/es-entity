import Expression from '../sql/Expression.js';
import Operator from '../sql/types/Operator.js';
import Entity from './Entity.js';
import FieldMapping from './FieldMapping.js';
import { PropKeys } from './types.js';

type ValueType = boolean | number | string | Date | Buffer;
type OperandType = ValueType | Expression;

class OperatorEntity<T extends Entity> {
	fieldMap: Map<string | number | symbol, FieldMapping> = null;
	alias: string = null;

	constructor(fieldMap: Map<string | symbol, FieldMapping>, alias?: string) {
		this.fieldMap = fieldMap;
		this.alias = alias;
	}

	expr(propName: PropKeys<T>) {
		let field = this.fieldMap.get(propName);
		let name = this.alias ? this.alias + '.' + field.colName : field.colName;
		return new Expression(name);
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
		return new Expression(null, Operator.Equal, this.expr(propName), this._argExp(operand));
	}
	neq(propName: PropKeys<T>, operand: OperandType) {
		return new Expression(null, Operator.NotEqual, this.expr(propName), this._argExp(operand));
	}
	lt(propName: PropKeys<T>, operand: OperandType) {
		return new Expression(null, Operator.LessThan, this.expr(propName), this._argExp(operand));
	}
	gt(propName: PropKeys<T>, operand: OperandType) {
		return new Expression(null, Operator.GreaterThan, this.expr(propName), this._argExp(operand));
	}
	lteq(propName: PropKeys<T>, operand: OperandType) {
		return new Expression(null, Operator.LessThanEqual, this.expr(propName), this._argExp(operand));
	}
	gteq(propName: PropKeys<T>, operand: OperandType) {
		return new Expression(null, Operator.GreaterThanEqual, this.expr(propName), this._argExp(operand));
	}

	// Logical Operators
	and(propName: PropKeys<T>, operand: Expression) {
		return new Expression(null, Operator.And, this.expr(propName), this._argExp(operand));
	}
	or(propName: PropKeys<T>, operand: Expression): Expression {
		return new Expression(null, Operator.Or, this.expr(propName), this._argExp(operand));
	}
	not(propName: PropKeys<T>): Expression {
		return new Expression(null, Operator.Not, this.expr(propName));
	}

	// Inclusion Funtions
	in(propName: PropKeys<T>, ...operand: ValueType[]) {
		let vals = operand.map(val => {
			let arg = new Expression('?');
			arg.args = arg.args.concat(val);
			return arg;
		});
		return new Expression(null, Operator.In, this.expr(propName), ...vals);
	}

	between(propName: PropKeys<T>, first: OperandType, second: OperandType) {
		return new Expression(null, Operator.Between, this.expr(propName), this._argExp(first), this._argExp(second));
	}

	like(propName: PropKeys<T>, operand: string) {
		return new Expression(null, Operator.Like, this.expr(propName), this._argExp(operand));
	}

	// Null Checks
	IsNull(propName: PropKeys<T>) {
		return new Expression(null, Operator.IsNull, this.expr(propName));
	}
	IsNotNull(propName: PropKeys<T>) {
		return new Expression(null, Operator.IsNotNull, this.expr(propName));
	}

	// Arithmatic Operators
	plus(propName: PropKeys<T>, operand: OperandType) {
		return new Expression(null, Operator.Plus, this.expr(propName), this._argExp(operand));
	}
	minus(propName: PropKeys<T>, operand: OperandType) {
		return new Expression(null, Operator.Minus, this.expr(propName), this._argExp(operand));
	}
	multiply(propName: PropKeys<T>, operand: OperandType) {
		return new Expression(null, Operator.Multiply, this.expr(propName), this._argExp(operand));
	}
	devide(propName: PropKeys<T>, operand: OperandType) {
		return new Expression(null, Operator.Devide, this.expr(propName), this._argExp(operand));
	}

	// Sorting Operators
	asc(propName: PropKeys<T>) {
		return new Expression(null, Operator.Asc, this.expr(propName));
	}
	desc(propName: PropKeys<T>) {
		return new Expression(null, Operator.Desc, this.expr(propName));
	}

	// Group Functions
	sum(propName: PropKeys<T>) {
		return new Expression(null, Operator.Sum, this.expr(propName));
	}
	min(propName: PropKeys<T>) {
		return new Expression(null, Operator.Min, this.expr(propName));
	}
	max(propName: PropKeys<T>) {
		return new Expression(null, Operator.Max, this.expr(propName));
	}
	count(propName: PropKeys<T>) {
		return new Expression(null, Operator.Count, this.expr(propName));
	}
	average(propName: PropKeys<T>) {
		return new Expression(null, Operator.Avg, this.expr(propName));
	}

}

export default OperatorEntity;
