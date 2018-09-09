import * as aggregation from 'aggregation/es6';

import Handler from '../Handler';
import INode from './INode';
import Operator from './Operator';
import Column from './Column';

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
		return new Expression(name);
	}

	_argExp(operand: T | Column) {
		let w: Expression = null;
		if (operand instanceof Column) {
			w = (<Column>operand)._createExpr();
		} else {
			w = new Expression('?');
			w.args = w.args.concat(operand);
		}
		return w;
	}

	// Column Interface functions
	// Comparison Operators
	eq(operand: T) {
		return new Expression(null, Operator.Equal, this._createExpr(), this._argExp(operand));
	}
	neq(operand: T) {
		return new Expression(null, Operator.NotEqual, this._createExpr(), this._argExp(operand));
	}
	lt(operand: T) {
		return new Expression(null, Operator.LessThan, this._createExpr(), this._argExp(operand));
	}
	gt(operand: T) {
		return new Expression(null, Operator.GreaterThan, this._createExpr(), this._argExp(operand));
	}
	lteq(operand: T) {
		return new Expression(null, Operator.LessThanEqual, this._createExpr(), this._argExp(operand));
	}
	gteq(operand: T) {
		return new Expression(null, Operator.GreaterThanEqual, this._createExpr(), this._argExp(operand));
	}

	// Logical Operators
	and(operand: Column) {
		return new Expression(null, Operator.And, this._createExpr(), this._argExp(operand));
	}
	or(operand: Column): Expression {
		return new Expression(null, Operator.Or, this._createExpr(), this._argExp(operand));
	}
	not(): Expression {
		return new Expression(null, Operator.Not, this._createExpr());
	}

	// Inclusion Funtions
	in(...operand: T[]) {
		let arg: Expression = new Expression(null, Operator.Comma);
		for (let i = 0; i < operand.length; i++) {
			arg.exps.push(this._argExp(operand[i]));
		}
		return new Expression(null, Operator.In, this._createExpr(), arg);
	}
	between(first: T, second: T) {
		return new Expression(null, Operator.Between, this._createExpr(), this._argExp(first), this._argExp(second));
	}
	like(operand: T) {
		return new Expression(null, Operator.Like, this._createExpr(), this._argExp(operand));
	}
	IsNull() {
		return new Expression(null, Operator.IsNull, this._createExpr());
	}
	IsNotNull() {
		return new Expression(null, Operator.IsNotNull, this._createExpr());
	}

	// Arithmatic Operators
	plus(operand: T) {
		return new Expression(null, Operator.Plus, this._createExpr(), this._argExp(operand));
	}
	minus(operand: T) {
		return new Expression(null, Operator.Minus, this._createExpr(), this._argExp(operand));
	}
	multiply(operand: T) {
		return new Expression(null, Operator.Multiply, this._createExpr(), this._argExp(operand));
	}
	devide(operand: T) {
		return new Expression(null, Operator.Devide, this._createExpr(), this._argExp(operand));
	}

	// Sorting Operators
	asc() {
		return new Expression(null, Operator.Asc, this._createExpr());
	}
	desc() {
		return new Expression(null, Operator.Desc, this._createExpr());
	}

	// Group Functions
	sum() {
		return new Expression(null, Operator.Sum, this._createExpr());
	}
	min() {
		return new Expression(null, Operator.Min, this._createExpr());
	}
	max() {
		return new Expression(null, Operator.Max, this._createExpr());
	}
	count() {
		return new Expression(null, Operator.Count, this._createExpr());
	}
	average() {
		return new Expression(null, Operator.Avg, this._createExpr());
	}

}

/**
 * SqlExpression
 */
class Expression extends aggregation(INode, Field) {
	args: Array<any> = new Array<any>();

	_alias: string = '';
	_name: string = '';
	_updated: boolean = false;

	value: string = null;
	exps: Array<Expression> = null;
	operator: Operator = null;

	constructor(value?: string, operator?: Operator, ...expressions: Array<Expression>) {
		super()
		this.value = value;
		this.exps = expressions;
		this.operator = operator;
	}

	add(...expressions: Array<Expression>): Expression {
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
			let exp: Expression = new Expression(null, Operator.And, this);
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

	_createExpr(): Expression {
		return this;
	}

}

export default Expression;
export { Field };
