import Column from './Column';
import Expression from './Expression';
import Operator from './types/Operator';

class Field<T> extends Column {
  protected _value: T = null;
  _alias: string = '';
  _name: string = '';
  _updated: boolean = false;

  constructor() {
    super();
  }

  get(): T {
    return this._value;
  }

  set(value: T) {
    if (value !== this._value) {
      this._updated = true;
      this._value = value;
    }
  }

  toJSON() {
    if (this._value != null) {
      return this._value.valueOf();
    } else {
      return null;
    }
  }

  expr() {
    let name = this._alias ? this._alias + '.' + this._name : this._name;
    return new Expression(name);
  }

  _argExp(operand: T | Column) {
    let w: Expression = null;
    if (operand instanceof Column) {
      w = (<Column>operand).expr();
    } else {
      w = new Expression('?');
      w.args = w.args.concat(operand);
    }
    return w;
  }

  // Column Interface functions
  // Comparison Operators
  eq(operand: T) {
    return new Expression(null, Operator.Equal, this.expr(), this._argExp(operand));
  }
  neq(operand: T) {
    return new Expression(null, Operator.NotEqual, this.expr(), this._argExp(operand));
  }
  lt(operand: T) {
    return new Expression(null, Operator.LessThan, this.expr(), this._argExp(operand));
  }
  gt(operand: T) {
    return new Expression(null, Operator.GreaterThan, this.expr(), this._argExp(operand));
  }
  lteq(operand: T) {
    return new Expression(null, Operator.LessThanEqual, this.expr(), this._argExp(operand));
  }
  gteq(operand: T) {
    return new Expression(null, Operator.GreaterThanEqual, this.expr(), this._argExp(operand));
  }

  // Logical Operators
  and(operand: Column) {
    return new Expression(null, Operator.And, this.expr(), this._argExp(operand));
  }
  or(operand: Column): Expression {
    return new Expression(null, Operator.Or, this.expr(), this._argExp(operand));
  }
  not(): Expression {
    return new Expression(null, Operator.Not, this.expr());
  }

  // Inclusion Funtions
  in(...operand: T[]) {
    let arg: Expression = new Expression(null, Operator.Comma);
    operand.forEach(oper => {
      arg.exps.push(this._argExp(oper));
    });
    return new Expression(null, Operator.In, this.expr(), arg);
  }

  between(first: T, second: T) {
    return new Expression(null, Operator.Between, this.expr(), this._argExp(first), this._argExp(second));
  }

  like(operand: T) {
    return new Expression(null, Operator.Like, this.expr(), this._argExp(operand));
  }

  IsNull() {
    return new Expression(null, Operator.IsNull, this.expr());
  }

  IsNotNull() {
    return new Expression(null, Operator.IsNotNull, this.expr());
  }

  // Arithmatic Operators
  plus(operand: T) {
    return new Expression(null, Operator.Plus, this.expr(), this._argExp(operand));
  }

  minus(operand: T) {
    return new Expression(null, Operator.Minus, this.expr(), this._argExp(operand));
  }

  multiply(operand: T) {
    return new Expression(null, Operator.Multiply, this.expr(), this._argExp(operand));
  }

  devide(operand: T) {
    return new Expression(null, Operator.Devide, this.expr(), this._argExp(operand));
  }

  // Sorting Operators
  asc() {
    return new Expression(null, Operator.Asc, this.expr());
  }
  desc() {
    return new Expression(null, Operator.Desc, this.expr());
  }

  // Group Functions
  sum() {
    return new Expression(null, Operator.Sum, this.expr());
  }

  min() {
    return new Expression(null, Operator.Min, this.expr());
  }

  max() {
    return new Expression(null, Operator.Max, this.expr());
  }

  count() {
    return new Expression(null, Operator.Count, this.expr());
  }

  average() {
    return new Expression(null, Operator.Avg, this.expr());
  }

}

export default Field;
