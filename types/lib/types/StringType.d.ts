import * as sql from '../sql';

declare class StringType extends String implements sql.Field<String> {
    set(value: string | String): void;

    // Field extended Methods
    _alias: string;
    _name: string;
    _updated: boolean;
    _createExpr(): sql.Expression;
    _argExp(operand: String | sql.Column): sql.Expression;
    eq(operand: String): sql.Expression;
    neq(operand: String): sql.Expression;
    lt(operand: String): sql.Expression;
    gt(operand: String): sql.Expression;
    lteq(operand: String): sql.Expression;
    gteq(operand: String): sql.Expression;
    and(operand: sql.Column): sql.Expression;
    or(operand: sql.Column): sql.Expression;
    not(): sql.Expression;
    in(...operand: String[]): sql.Expression;
    between(first: String, second: String): sql.Expression;
    like(operand: String): sql.Expression;
    IsNull(): sql.Expression;
    IsNotNull(): sql.Expression;
    plus(operand: String): sql.Expression;
    minus(operand: String): sql.Expression;
    multiply(operand: String): sql.Expression;
    devide(operand: String): sql.Expression;
    asc(): sql.Expression;
    desc(): sql.Expression;
    sum(): sql.Expression;
    min(): sql.Expression;
    max(): sql.Expression;
    count(): sql.Expression;
    average(): sql.Expression;
}
export default StringType;
