import Expression from './Expression';

abstract class Column {
	_alias: string = '';
	_name: string = '';
	_updated: boolean = false;

	abstract expr(): Expression
	abstract _argExp(operand: any): Expression

	// Comparison Operators
	abstract eq(operand: any): Expression;
	abstract neq(operand: any): Expression;
	abstract lt(operand: any): Expression;
	abstract gt(operand: any): Expression;
	abstract lteq(operand: any): Expression;
	abstract gteq(operand: any): Expression;

	// Logical Operators
	abstract and(operand: Column): Expression;
	abstract or(operand: Column): Expression;
	abstract not(): Expression;

	// Inclusion Funtions
	abstract in(...operand: any[]): Expression;
	abstract between(first: any, second: any): Expression;
	abstract like(operand: any): Expression;
	abstract IsNull(): Expression;
	abstract IsNotNull(): Expression;

	// Arithmatic Operators
	abstract plus(operand: any): Expression;
	abstract minus(operand: any): Expression;
	abstract multiply(operand: any): Expression;
	abstract devide(operand: any): Expression;

	// Sorting Operators
	abstract asc(): Expression;
	abstract desc(): Expression;

	// Group Functions
	abstract sum(): Expression;
	abstract min(): Expression;
	abstract max(): Expression;
	abstract count(): Expression;
	abstract average(): Expression;
}

export default Column;
