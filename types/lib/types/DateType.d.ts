import * as Query from '../Query';
declare class DateType extends Date implements Query.Field<Date> {
    set(value: Date): void;

    // Field extended Methods
    _alias: string;
    _name: string;
    _updated: boolean;
    _createExpr(): Query.SqlExpression;
    _argExp(operand: Date | Query.Column): Query.SqlExpression;
    eq(operand: Date): Query.SqlExpression;
    neq(operand: Date): Query.SqlExpression;
    lt(operand: Date): Query.SqlExpression;
    gt(operand: Date): Query.SqlExpression;
    lteq(operand: Date): Query.SqlExpression;
    gteq(operand: Date): Query.SqlExpression;
    and(operand: Query.Column): Query.SqlExpression;
    or(operand: Query.Column): Query.SqlExpression;
    not(): Query.SqlExpression;
    in(...operand: Date[]): Query.SqlExpression;
    between(first: Date, second: Date): Query.SqlExpression;
    like(operand: Date): Query.SqlExpression;
    IsNull(): Query.SqlExpression;
    IsNotNull(): Query.SqlExpression;
    plus(operand: Date): Query.SqlExpression;
    minus(operand: Date): Query.SqlExpression;
    multiply(operand: Date): Query.SqlExpression;
    devide(operand: Date): Query.SqlExpression;
    asc(): Query.SqlExpression;
    desc(): Query.SqlExpression;
    sum(): Query.SqlExpression;
    min(): Query.SqlExpression;
    max(): Query.SqlExpression;
    count(): Query.SqlExpression;
    average(): Query.SqlExpression;
}
export default DateType;
