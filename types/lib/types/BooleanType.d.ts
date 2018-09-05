import * as Query from '../Query';

declare class BooleanType extends Boolean implements Query.Field<Boolean> {
    set(value: boolean): void;

    // Field extended Methods
    _alias: string;
    _name: string;
    _updated: boolean;
    _createExpr(): Query.SqlExpression;
    _argExp(operand: Boolean | Query.Column): Query.SqlExpression;
    eq(operand: Boolean): Query.SqlExpression;
    neq(operand: Boolean): Query.SqlExpression;
    lt(operand: Boolean): Query.SqlExpression;
    gt(operand: Boolean): Query.SqlExpression;
    lteq(operand: Boolean): Query.SqlExpression;
    gteq(operand: Boolean): Query.SqlExpression;
    and(operand: Query.Column): Query.SqlExpression;
    or(operand: Query.Column): Query.SqlExpression;
    not(): Query.SqlExpression;
    in(...operand: Boolean[]): Query.SqlExpression;
    between(first: Boolean, second: Boolean): Query.SqlExpression;
    like(operand: Boolean): Query.SqlExpression;
    IsNull(): Query.SqlExpression;
    IsNotNull(): Query.SqlExpression;
    plus(operand: Boolean): Query.SqlExpression;
    minus(operand: Boolean): Query.SqlExpression;
    multiply(operand: Boolean): Query.SqlExpression;
    devide(operand: Boolean): Query.SqlExpression;
    asc(): Query.SqlExpression;
    desc(): Query.SqlExpression;
    sum(): Query.SqlExpression;
    min(): Query.SqlExpression;
    max(): Query.SqlExpression;
    count(): Query.SqlExpression;
    average(): Query.SqlExpression;
}
export default BooleanType;
