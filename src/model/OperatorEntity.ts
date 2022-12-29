import Expression from '../sql/Expression.js';
import Operator from '../sql/types/Operator.js';

type ValueType = boolean | number | string | Date | Buffer;
type OperandType = ValueType | Expression;

class OperatorEntity<T extends Object> {
	alias: string = null;

	constructor(alias?: string) {
		this.alias = alias;
	}

	expr(propName: keyof T) {
		let name = this.alias ? this.alias + '.' + <string>propName : <string>propName;
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
	eq(propName: keyof T, operand: OperandType) {
		return new Expression(null, Operator.Equal, this.expr(propName), this._argExp(operand));
	}
	neq(propName: keyof T, operand: OperandType) {
		return new Expression(null, Operator.NotEqual, this.expr(propName), this._argExp(operand));
	}
	lt(propName: keyof T, operand: OperandType) {
		return new Expression(null, Operator.LessThan, this.expr(propName), this._argExp(operand));
	}
	gt(propName: keyof T, operand: OperandType) {
		return new Expression(null, Operator.GreaterThan, this.expr(propName), this._argExp(operand));
	}
	lteq(propName: keyof T, operand: OperandType) {
		return new Expression(null, Operator.LessThanEqual, this.expr(propName), this._argExp(operand));
	}
	gteq(propName: keyof T, operand: OperandType) {
		return new Expression(null, Operator.GreaterThanEqual, this.expr(propName), this._argExp(operand));
	}

	// Logical Operators
	and(propName: keyof T, operand: Expression) {
		return new Expression(null, Operator.And, this.expr(propName), this._argExp(operand));
	}
	or(propName: keyof T, operand: Expression): Expression {
		return new Expression(null, Operator.Or, this.expr(propName), this._argExp(operand));
	}
	not(propName: keyof T): Expression {
		return new Expression(null, Operator.Not, this.expr(propName));
	}

	// Inclusion Funtions
	in(propName: keyof T, ...operand: ValueType[]) {
		let vals = operand.map(val => {
			let arg = new Expression('?');
			arg.args = arg.args.concat(val);
			return arg;
		});
		return new Expression(null, Operator.In, this.expr(propName), ...vals);
	}

	between(propName: keyof T, first: OperandType, second: OperandType) {
		return new Expression(null, Operator.Between, this.expr(propName), this._argExp(first), this._argExp(second));
	}

	like(propName: keyof T, operand: string) {
		return new Expression(null, Operator.Like, this.expr(propName), this._argExp(operand));
	}

	// Null Checks
	IsNull(propName: keyof T) {
		return new Expression(null, Operator.IsNull, this.expr(propName));
	}
	IsNotNull(propName: keyof T) {
		return new Expression(null, Operator.IsNotNull, this.expr(propName));
	}

	// Arithmatic Operators
	plus(propName: keyof T, operand: OperandType) {
		return new Expression(null, Operator.Plus, this.expr(propName), this._argExp(operand));
	}
	minus(propName: keyof T, operand: OperandType) {
		return new Expression(null, Operator.Minus, this.expr(propName), this._argExp(operand));
	}
	multiply(propName: keyof T, operand: OperandType) {
		return new Expression(null, Operator.Multiply, this.expr(propName), this._argExp(operand));
	}
	devide(propName: keyof T, operand: OperandType) {
		return new Expression(null, Operator.Devide, this.expr(propName), this._argExp(operand));
	}

	// Sorting Operators
	asc(propName: keyof T) {
		return new Expression(null, Operator.Asc, this.expr(propName));
	}
	desc(propName: keyof T) {
		return new Expression(null, Operator.Desc, this.expr(propName));
	}

	// Group Functions
	sum(propName: keyof T) {
		return new Expression(null, Operator.Sum, this.expr(propName));
	}
	min(propName: keyof T) {
		return new Expression(null, Operator.Min, this.expr(propName));
	}
	max(propName: keyof T) {
		return new Expression(null, Operator.Max, this.expr(propName));
	}
	count(propName: keyof T) {
		return new Expression(null, Operator.Count, this.expr(propName));
	}
	average(propName: keyof T) {
		return new Expression(null, Operator.Avg, this.expr(propName));
	}

}

export default OperatorEntity;
