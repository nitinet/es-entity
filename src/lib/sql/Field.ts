import Column from './Column';
import SqlExpression from './SqlExpression';
import Operator from './Operator';

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

export default Field;
