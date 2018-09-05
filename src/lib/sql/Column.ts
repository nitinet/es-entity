import SqlExpression from './SqlExpression';

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

export default Column;
