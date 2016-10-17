export abstract class ISqlNode {
	args: Array<any> = new Array<any>();
	abstract eval(): string;
}

/**
 * SqlStatement
 */
export class SqlStatement extends ISqlNode {
	command: string = "";
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

	eval(): string {
		let result: string = "";

		// Column
		let columnStr: string = "";
		for (let i = 0; i < this.columns.length; i++) {
			let element = this.columns[i];
			let val = element.eval();
			if (i == 0)
				columnStr = columnStr.concat(" " + val);
			else
				columnStr = columnStr.concat(", " + val);
			this.args = this.args.concat(element.args);
		}

		// Collection
		let collectionStr: string = this.collection.eval();
		this.args = this.args.concat(this.collection.args);

		// Where
		let whereStr: string = this.where.eval();
		this.args = this.args.concat(this.where.args);

		// Group By
		let groupByStr: string = "";
		for (let i = 0; i < this.groupBy.length; i++) {
			let element = this.groupBy[i];
			let val = element.eval();
			if (i == 0)
				groupByStr = groupByStr.concat(" " + val);
			else
				groupByStr = groupByStr.concat(", " + val);
			this.args = this.args.concat(element.args);
		}

		// Order By
		let orderByStr: string = "";
		for (let i = 0; i < this.orderBy.length; i++) {
			let element = this.orderBy[i];
			let val = element.eval();
			if (i == 0)
				orderByStr = orderByStr.concat(" " + val);
			else
				orderByStr = orderByStr.concat(", " + val);
			this.args = this.args.concat(element.args);
		}

		// Where
		let limitStr: string = this.limit.eval();
		this.args = this.args.concat(this.limit.args);

		// Values
		let valueStr: string = "";
		for (let i = 0; i < this.values.length; i++) {
			let element = this.values[i];
			let val = element.eval();
			if (i == 0)
				valueStr = valueStr.concat(" " + val);
			else
				valueStr = valueStr.concat(", " + val);
			this.args = this.args.concat(element.args);
		}

		this.command = this.command.toLowerCase();
		if (this.command === "insert") {
			result = result.concat("insert into ", collectionStr, "(", columnStr, ") values (", valueStr, ")");
		} else if (this.command == "select") {
			result = result.concat("select", columnStr, " from ", collectionStr);
			if (whereStr)
				result = result.concat(" where ", whereStr);
			if (groupByStr)
				result = result.concat(" group by ", groupByStr);
			if (orderByStr)
				result = result.concat(" order by ", orderByStr);
			if (limitStr)
				result = result.concat(limitStr);
		} else if (this.command === "update") {
			result = result.concat("update ", collectionStr, " set ", columnStr, " where ", whereStr);
		} else if (this.command === "delete") {
			result = result.concat("delete from ", collectionStr, " where ", whereStr);
		}
		return result;
	}
}

/**
 * SqlCollection
 * Used for tables and columns
 */
export class SqlCollection extends ISqlNode {
	colAlias: string = null;
	value: string = null;
	stat: SqlStatement = null;
	alias: string = null;

	constructor() {
		super()
	}

	eval(): string {
		let result: string = "";
		if (this.value)
			result = this.colAlias ? this.colAlias + "." + this.value : this.value;
		else if (this.stat) {
			this.args = this.args.concat(this.stat.args);
			result = "(" + this.stat.eval() + ")";
		}
		if (!result) {
			throw "No Collection Found";
		}
		if (this.alias)
			result = result.concat(" as ", this.alias);
		return result;
	}
}

export abstract class Column {
	_alias: string = "";
	_name: string = "";
	_updated: boolean = false;

	abstract set(value: any): void
	abstract get(): any;
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

export enum Operator {
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

/**
 * SqlExpression
 */
export class SqlExpression extends ISqlNode implements Column {
	_alias: string = "";
	_name: string = "";
	_updated: boolean = false;

	value: string = null;
	exps: Array<SqlExpression> = null;
	operator: Operator = null;

	set() { }
	get() {
		return null;
	}

	add(...expressions: Array<SqlExpression>): SqlExpression {
		if (this.operator == Operator.And) {
			this.exps = this.exps.concat(expressions);
			return this;
		} else {
			let exp: SqlExpression = new SqlExpression(null, Operator.And, this);
			for (var i = 0; i < expressions.length; i++) {
				exp.add(expressions[i]);
			}
			return exp;
		}
	}

	constructor(value?: string, operator?: Operator, ...expressions: Array<SqlExpression>) {
		super()
		this.value = value;
		this.exps = expressions;
		this.operator = operator;
	}

	eval(): string {
		if (this.value) {
			return this.value;
		} else if (this.exps) {
			let values: Array<string> = new Array<string>();
			for (let i = 0; i < this.exps.length; i++) {
				values[i] = this.exps[i].eval();
				this.args = this.args.concat(this.exps[i].args);
			}

			if (!this.operator && this.exps.length > 1) {
				this.operator = Operator.And;
			}

			let val0: string = values[0] ? values[0] : "";
			let val1: string = values[1] ? values[1] : "";

			let r: string = "";
			switch (this.operator) {
				case Operator.Equal:
					r = val0 + " = " + val1;
					break;
				case Operator.NotEqual:
					r = val0 + " != " + val1;
					break;
				case Operator.LessThan:
					r = val0 + " < " + val1;
					break;
				case Operator.LessThanEqual:
					r = val0 + " <= " + val1;
					break;
				case Operator.GreaterThan:
					r = val0 + " > " + val1;
					break;
				case Operator.GreaterThanEqual:
					r = val0 + " >= " + val1;
					break;
				case Operator.And:
					r = "(" + val0;
					for (let i = 1; i < values.length; i++)
						r = r + ") and (" + values[i];
					r = r + ")";
					break;
				case Operator.Or:
					r = "(" + val0;
					for (let i = 1; i < values.length; i++)
						r = r + ") or (" + values[i];
					r = r + ")";
					break;
				case Operator.Not:
					r = " not " + val0;
					break;
				case Operator.Plus:
					r = val0 + " + " + val1;
					break;
				case Operator.Minus:
					r = val0 + " - " + val1;
					break;
				case Operator.Multiply:
					r = val0 + " * " + val1;
					break;
				case Operator.Devide:
					r = val0 + " / " + val1;
					break;
				case Operator.Between:
					r = val0 + " between " + val1 + " and " + values[2];
					break;
				case Operator.Exists:
					r = " exists (" + val0 + ")";
					break;
				case Operator.In:
					r = val0 + " in (" + val1 + ")";
					break;
				case Operator.Like:
					r = val0 + " like " + val1;
					break;
				case Operator.IsNull:
					r = val0 + " is null";
					break;
				case Operator.IsNotNull:
					r = val0 + " is not null";
					break;
				case Operator.Asc:
					r = val0 + " asc";
					break;
				case Operator.Desc:
					r = val0 + " desc";
					break;
				case Operator.Limit: {
					r = " limit " + val0 + (val1 ? "," + val1 : "");
				}
					break;
				case Operator.Comma: {
					for (let i = 0; i < values.length; i++)
						r = r.concat(values[i], ", ");
					r = r.slice(0, r.length - 2);
				}
					break;
				case Operator.Count:
					r = "count(" + val0 + ")";
					break;
				case Operator.Sum:
					r = "sum(" + val0 + ")";
					break;
				case Operator.Min:
					r = "min(" + val0 + ")";
					break;
				case Operator.Max:
					r = "max(" + val0 + ")";
					break;
				case Operator.Avg:
					r = "avg(" + val0 + ")";
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

	_argExp(operand: any): SqlExpression {
		let w: SqlExpression = null;
		if (operand instanceof Column) {
			w = (<Column>operand)._createExpr();
		} else {
			w = new SqlExpression("?");
			w.args = w.args.concat(operand);
		}
		return w;
	}

	// Column Interface functions
	// Comparison Operators
	eq(operand: any): SqlExpression {
		return new SqlExpression(null, Operator.Equal, this._createExpr(), this._argExp(operand));
	}
	neq(operand: any): SqlExpression {
		return new SqlExpression(null, Operator.NotEqual, this._createExpr(), this._argExp(operand));
	}
	lt(operand: any): SqlExpression {
		return new SqlExpression(null, Operator.LessThan, this._createExpr(), this._argExp(operand));
	}
	gt(operand: any): SqlExpression {
		return new SqlExpression(null, Operator.GreaterThan, this._createExpr(), this._argExp(operand));
	}
	lteq(operand: any): SqlExpression {
		return new SqlExpression(null, Operator.LessThanEqual, this._createExpr(), this._argExp(operand));
	}
	gteq(operand: any): SqlExpression {
		return new SqlExpression(null, Operator.GreaterThanEqual, this._createExpr(), this._argExp(operand));
	}

	// Logical Operators
	and(operand: SqlExpression): SqlExpression {
		return new SqlExpression(null, Operator.And, this._createExpr(), this._argExp(operand));
	}
	or(operand: SqlExpression): SqlExpression {
		return new SqlExpression(null, Operator.Or, this._createExpr(), this._argExp(operand));
	}
	not(): SqlExpression {
		return new SqlExpression(null, Operator.Not, this._createExpr());
	}

	// Inclusion Funtions
	in(...operand: any[]): SqlExpression {
		let arg: SqlExpression = new SqlExpression(null, Operator.Comma);
		for (let i = 0; i < operand.length; i++) {
			arg.exps.push(this._argExp(operand[i]));
		}
		return new SqlExpression(null, Operator.In, this._createExpr(), arg);
	}
	between(first: any, second: any): SqlExpression {
		return new SqlExpression(null, Operator.Between, this._createExpr(), this._argExp(first), this._argExp(second));
	}
	like(operand: any): SqlExpression {
		return new SqlExpression(null, Operator.Like, this._createExpr(), this._argExp(operand));
	}
	IsNull(): SqlExpression {
		return new SqlExpression(null, Operator.IsNull, this._createExpr());
	}
	IsNotNull(): SqlExpression {
		return new SqlExpression(null, Operator.IsNotNull, this._createExpr());
	}

	// Arithmatic Operators
	plus(operand: any): SqlExpression {
		return new SqlExpression(null, Operator.Plus, this._createExpr(), this._argExp(operand));
	}
	minus(operand: any): SqlExpression {
		return new SqlExpression(null, Operator.Minus, this._createExpr(), this._argExp(operand));
	}
	multiply(operand: any): SqlExpression {
		return new SqlExpression(null, Operator.Multiply, this._createExpr(), this._argExp(operand));
	}
	devide(operand: any): SqlExpression {
		return new SqlExpression(null, Operator.Devide, this._createExpr(), this._argExp(operand));
	}

	// Sorting Operators
	asc(): SqlExpression {
		return new SqlExpression(null, Operator.Asc, this._createExpr());
	}
	desc(): SqlExpression {
		return new SqlExpression(null, Operator.Desc, this._createExpr());
	}

	// Group Functions
	sum(): SqlExpression {
		return new SqlExpression(null, Operator.Sum, this._createExpr());
	}
	min(): SqlExpression {
		return new SqlExpression(null, Operator.Min, this._createExpr());
	}
	max(): SqlExpression {
		return new SqlExpression(null, Operator.Max, this._createExpr());
	}
	count(): SqlExpression {
		return new SqlExpression(null, Operator.Count, this._createExpr());
	}
	average(): SqlExpression {
		return new SqlExpression(null, Operator.Avg, this._createExpr());
	}

}
