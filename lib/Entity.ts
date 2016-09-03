import * as Query from "./Query";

export interface IEntityType<T> {
	new (): T;
}

export class StringField extends String implements Query.Column {
	_alias: string = "";
	_name: string = "";
	_updated: boolean = false;

	_value: string = null;

	constructor(data?: string) {
		super(data);
		this._value = data;
	}

	get(): String {
		return this._value;
	}

	set(value: string) {
		this._updated = true;
		this._value = value;
	}

	_createExpr(): Query.SqlExpression {
		let name = this._alias ? this._alias + "." + this._name : this._name;
		return new Query.SqlExpression(name);
	}

	_argExp(operand: any): Query.SqlExpression {
		let w: Query.SqlExpression = null;
		if (operand instanceof Query.Column) {
			w = (<Query.Column>operand)._createExpr();
		} else {
			w = new Query.SqlExpression("?");
			w.args = w.args.concat(operand);
		}
		return w;
	}

	// Column Interface functions
	// Comparison Operators
	eq(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Equal, this._createExpr(), this._argExp(operand));
	}
	neq(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.NotEqual, this._createExpr(), this._argExp(operand));
	}
	lt(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.LessThan, this._createExpr(), this._argExp(operand));
	}
	gt(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.GreaterThan, this._createExpr(), this._argExp(operand));
	}
	lteq(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.LessThanEqual, this._createExpr(), this._argExp(operand));
	}
	gteq(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.GreaterThanEqual, this._createExpr(), this._argExp(operand));
	}

	// Logical Operators
	and(operand: Query.Column): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.And, this._createExpr(), this._argExp(operand));
	}
	or(operand: Query.Column): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Or, this._createExpr(), this._argExp(operand));
	}
	not(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Not, this._createExpr());
	}

	// Inclusion Funtions
	in(...operand: any[]): Query.SqlExpression {
		let arg: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.Comma);
		for (let i = 0; i < operand.length; i++) {
			arg.exps.push(this._argExp(operand[i]));
		}
		return new Query.SqlExpression(null, Query.Operator.In, this._createExpr(), arg);
	}
	between(first: any, second: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Between, this._createExpr(), this._argExp(first), this._argExp(second));
	}
	like(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Like, this._createExpr(), this._argExp(operand));
	}
	IsNull(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.IsNull, this._createExpr());
	}
	IsNotNull(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.IsNotNull, this._createExpr());
	}

	// Arithmatic Operators
	plus(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Plus, this._createExpr(), this._argExp(operand));
	}
	minus(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Minus, this._createExpr(), this._argExp(operand));
	}
	multiply(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Multiply, this._createExpr(), this._argExp(operand));
	}
	devide(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Devide, this._createExpr(), this._argExp(operand));
	}

	// Sorting Operators
	asc(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Asc, this._createExpr());
	}
	desc(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Desc, this._createExpr());
	}

	// Group Functions
	sum(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Sum, this._createExpr());
	}
	min(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Min, this._createExpr());
	}
	max(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Max, this._createExpr());
	}
	count(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Count, this._createExpr());
	}
	average(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Avg, this._createExpr());
	}
}

export class NumberField extends Number implements Query.Column {
	_alias: string = "";
	_name: string = "";
	_updated: boolean = false;

	_value: number = null;

	constructor(data?: number) {
		super(data);
		this._value = data;
	}

	get(): Number {
		return this._value;
	}

	set(value: number) {
		this._updated = true;
		this._value = value;
	}

	_createExpr(): Query.SqlExpression {
		let name = this._alias ? this._alias + "." + this._name : this._name;
		return new Query.SqlExpression(name);
	}

	_argExp(operand: any): Query.SqlExpression {
		let w: Query.SqlExpression = null;
		if (operand instanceof Query.Column) {
			w = (<Query.Column>operand)._createExpr();
		} else {
			w = new Query.SqlExpression("?");
			w.args = w.args.concat(operand);
		}
		return w;
	}

	// Column Interface functions
	// Comparison Operators
	eq(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Equal, this._createExpr(), this._argExp(operand));
	}
	neq(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.NotEqual, this._createExpr(), this._argExp(operand));
	}
	lt(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.LessThan, this._createExpr(), this._argExp(operand));
	}
	gt(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.GreaterThan, this._createExpr(), this._argExp(operand));
	}
	lteq(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.LessThanEqual, this._createExpr(), this._argExp(operand));
	}
	gteq(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.GreaterThanEqual, this._createExpr(), this._argExp(operand));
	}

	// Logical Operators
	and(operand: Query.Column): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.And, this._createExpr(), this._argExp(operand));
	}
	or(operand: Query.Column): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Or, this._createExpr(), this._argExp(operand));
	}
	not(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Not, this._createExpr());
	}

	// Inclusion Funtions
	in(...operand: any[]): Query.SqlExpression {
		let arg: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.Comma);
		for (let i = 0; i < operand.length; i++) {
			arg.exps.push(this._argExp(operand[i]));
		}
		return new Query.SqlExpression(null, Query.Operator.In, this._createExpr(), arg);
	}
	between(first: any, second: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Between, this._createExpr(), this._argExp(first), this._argExp(second));
	}
	like(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Like, this._createExpr(), this._argExp(operand));
	}
	IsNull(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.IsNull, this._createExpr());
	}
	IsNotNull(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.IsNotNull, this._createExpr());
	}

	// Arithmatic Operators
	plus(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Plus, this._createExpr(), this._argExp(operand));
	}
	minus(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Minus, this._createExpr(), this._argExp(operand));
	}
	multiply(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Multiply, this._createExpr(), this._argExp(operand));
	}
	devide(operand: any): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Devide, this._createExpr(), this._argExp(operand));
	}

	// Sorting Operators
	asc(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Asc, this._createExpr());
	}
	desc(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Desc, this._createExpr());
	}

	// Group Functions
	sum(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Sum, this._createExpr());
	}
	min(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Min, this._createExpr());
	}
	max(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Max, this._createExpr());
	}
	count(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Count, this._createExpr());
	}
	average(): Query.SqlExpression {
		return new Query.SqlExpression(null, Query.Operator.Avg, this._createExpr());
	}
}
