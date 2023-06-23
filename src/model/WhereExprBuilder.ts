import Expression from '../sql/Expression.js';
import Operator from '../sql/types/Operator.js';
import BaseExprBuilder from './BaseExprBuilder.js';
import FieldMapping from './FieldMapping.js';
import { PropKeys, OperandType } from './types.js';

class WhereExprBuilder<T> extends BaseExprBuilder<T> {

	constructor(fieldMap: Map<string | symbol, FieldMapping>, alias?: string) {
		super(fieldMap, alias);
	}

	private _argExp(operand: OperandType<T, keyof T>) {
		if (operand instanceof Expression) {
			return operand;
		} else {
			let res = new Expression('?');
			res.args = res.args.concat(operand);
			return res;
		}
	}

	// Comparison Operators
	eq<K extends PropKeys<T>>(propName: K, operand: OperandType<T, K>) {
		return new Expression(null, Operator.Equal, this._expr(propName), this._argExp(operand));
	}
	neq<K extends PropKeys<T>>(propName: K, operand: OperandType<T, K>) {
		return new Expression(null, Operator.NotEqual, this._expr(propName), this._argExp(operand));
	}
	lt<K extends PropKeys<T>>(propName: K, operand: OperandType<T, K>) {
		return new Expression(null, Operator.LessThan, this._expr(propName), this._argExp(operand));
	}
	gt<K extends PropKeys<T>>(propName: K, operand: OperandType<T, K>) {
		return new Expression(null, Operator.GreaterThan, this._expr(propName), this._argExp(operand));
	}
	lteq<K extends PropKeys<T>>(propName: K, operand: OperandType<T, K>) {
		return new Expression(null, Operator.LessThanEqual, this._expr(propName), this._argExp(operand));
	}
	gteq<K extends PropKeys<T>>(propName: K, operand: OperandType<T, K>) {
		return new Expression(null, Operator.GreaterThanEqual, this._expr(propName), this._argExp(operand));
	}

	// Logical Operators
	and<K extends PropKeys<T>>(propName: K, operand: Expression) {
		return new Expression(null, Operator.And, this._expr(propName), this._argExp(operand));
	}
	or<K extends PropKeys<T>>(propName: K, operand: Expression): Expression {
		return new Expression(null, Operator.Or, this._expr(propName), this._argExp(operand));
	}
	not<K extends PropKeys<T>>(propName: K): Expression {
		return new Expression(null, Operator.Not, this._expr(propName));
	}

	// Inclusion Funtions
	in<K extends PropKeys<T>>(propName: K, ...operand: OperandType<T, K>[]) {
		let vals = operand.map(val => {
			let arg = new Expression('?');
			arg.args = arg.args.concat(val);
			return arg;
		});
		return new Expression(null, Operator.In, this._expr(propName), ...vals);
	}

	between<K extends PropKeys<T>>(propName: K, first: OperandType<T, K>, second: OperandType<T, K>) {
		return new Expression(null, Operator.Between, this._expr(propName), this._argExp(first), this._argExp(second));
	}

	like<K extends PropKeys<T>>(propName: K, operand: OperandType<T, K>) {
		return new Expression(null, Operator.Like, this._expr(propName), this._argExp(operand));
	}

	// Null Checks
	IsNull<K extends PropKeys<T>>(propName: K) {
		return new Expression(null, Operator.IsNull, this._expr(propName));
	}
	IsNotNull<K extends PropKeys<T>>(propName: K) {
		return new Expression(null, Operator.IsNotNull, this._expr(propName));
	}

	// Arithmatic Operators
	plus<K extends PropKeys<T>>(propName: K, operand: OperandType<T, K>) {
		return new Expression(null, Operator.Plus, this._expr(propName), this._argExp(operand));
	}
	minus<K extends PropKeys<T>>(propName: K, operand: OperandType<T, K>) {
		return new Expression(null, Operator.Minus, this._expr(propName), this._argExp(operand));
	}
	multiply<K extends PropKeys<T>>(propName: K, operand: OperandType<T, K>) {
		return new Expression(null, Operator.Multiply, this._expr(propName), this._argExp(operand));
	}
	devide<K extends PropKeys<T>>(propName: K, operand: OperandType<T, K>) {
		return new Expression(null, Operator.Devide, this._expr(propName), this._argExp(operand));
	}

	// Group Functions
	sum<K extends PropKeys<T>>(propName: K) {
		return new Expression(null, Operator.Sum, this._expr(propName));
	}
	min<K extends PropKeys<T>>(propName: K) {
		return new Expression(null, Operator.Min, this._expr(propName));
	}
	max<K extends PropKeys<T>>(propName: K) {
		return new Expression(null, Operator.Max, this._expr(propName));
	}
	count<K extends PropKeys<T>>(propName: K) {
		return new Expression(null, Operator.Count, this._expr(propName));
	}
	average<K extends PropKeys<T>>(propName: K) {
		return new Expression(null, Operator.Avg, this._expr(propName));
	}

}

export default WhereExprBuilder;
