import * as Query from '../Query';

declare class NumberType extends Number implements Query.Field<Number> {
    set(value: number | Number): void;

    // Field extended Methods
    _alias: string;
    _name: string;
    _updated: boolean;
    _createExpr(): Query.SqlExpression;
    _argExp(operand: Number | Query.Column): Query.SqlExpression;
    eq(operand: Number): Query.SqlExpression;
    neq(operand: Number): Query.SqlExpression;
    lt(operand: Number): Query.SqlExpression;
    gt(operand: Number): Query.SqlExpression;
    lteq(operand: Number): Query.SqlExpression;
    gteq(operand: Number): Query.SqlExpression;
    and(operand: Query.Column): Query.SqlExpression;
    or(operand: Query.Column): Query.SqlExpression;
    not(): Query.SqlExpression;
    in(...operand: Number[]): Query.SqlExpression;
    between(first: Number, second: Number): Query.SqlExpression;
    like(operand: Number): Query.SqlExpression;
    IsNull(): Query.SqlExpression;
    IsNotNull(): Query.SqlExpression;
    plus(operand: Number): Query.SqlExpression;
    minus(operand: Number): Query.SqlExpression;
    multiply(operand: Number): Query.SqlExpression;
    devide(operand: Number): Query.SqlExpression;
    asc(): Query.SqlExpression;
    desc(): Query.SqlExpression;
    sum(): Query.SqlExpression;
    min(): Query.SqlExpression;
    max(): Query.SqlExpression;
    count(): Query.SqlExpression;
    average(): Query.SqlExpression;
}
export default NumberType;
