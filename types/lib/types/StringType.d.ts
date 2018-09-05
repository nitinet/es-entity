import * as Query from '../Query';

declare class StringType extends String implements Query.Field<String> {
    set(value: string | String): void;

    // Field extended Methods
    _alias: string;
    _name: string;
    _updated: boolean;
    _createExpr(): Query.SqlExpression;
    _argExp(operand: String | Query.Column): Query.SqlExpression;
    eq(operand: String): Query.SqlExpression;
    neq(operand: String): Query.SqlExpression;
    lt(operand: String): Query.SqlExpression;
    gt(operand: String): Query.SqlExpression;
    lteq(operand: String): Query.SqlExpression;
    gteq(operand: String): Query.SqlExpression;
    and(operand: Query.Column): Query.SqlExpression;
    or(operand: Query.Column): Query.SqlExpression;
    not(): Query.SqlExpression;
    in(...operand: String[]): Query.SqlExpression;
    between(first: String, second: String): Query.SqlExpression;
    like(operand: String): Query.SqlExpression;
    IsNull(): Query.SqlExpression;
    IsNotNull(): Query.SqlExpression;
    plus(operand: String): Query.SqlExpression;
    minus(operand: String): Query.SqlExpression;
    multiply(operand: String): Query.SqlExpression;
    devide(operand: String): Query.SqlExpression;
    asc(): Query.SqlExpression;
    desc(): Query.SqlExpression;
    sum(): Query.SqlExpression;
    min(): Query.SqlExpression;
    max(): Query.SqlExpression;
    count(): Query.SqlExpression;
    average(): Query.SqlExpression;
}
export default StringType;
