import * as sql from '../sql';

declare class BooleanType extends Boolean implements sql.Field<Boolean> {
    set(value: boolean): void;

    // Field extended Methods
    _alias: string;
    _name: string;
    _updated: boolean;
    _createExpr(): sql.Expression;
    _argExp(operand: Boolean | sql.Column): sql.Expression;
    eq(operand: Boolean): sql.Expression;
    neq(operand: Boolean): sql.Expression;
    lt(operand: Boolean): sql.Expression;
    gt(operand: Boolean): sql.Expression;
    lteq(operand: Boolean): sql.Expression;
    gteq(operand: Boolean): sql.Expression;
    and(operand: sql.Column): sql.Expression;
    or(operand: sql.Column): sql.Expression;
    not(): sql.Expression;
    in(...operand: Boolean[]): sql.Expression;
    between(first: Boolean, second: Boolean): sql.Expression;
    like(operand: Boolean): sql.Expression;
    IsNull(): sql.Expression;
    IsNotNull(): sql.Expression;
    plus(operand: Boolean): sql.Expression;
    minus(operand: Boolean): sql.Expression;
    multiply(operand: Boolean): sql.Expression;
    devide(operand: Boolean): sql.Expression;
    asc(): sql.Expression;
    desc(): sql.Expression;
    sum(): sql.Expression;
    min(): sql.Expression;
    max(): sql.Expression;
    count(): sql.Expression;
    average(): sql.Expression;
}
export default BooleanType;
