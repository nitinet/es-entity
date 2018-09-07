import * as sql from '../sql';

declare class NumberType extends Number implements sql.Field<Number> {
    set(value: number | Number): void;

    // Field extended Methods
    _alias: string;
    _name: string;
    _updated: boolean;
    _createExpr(): sql.Expression;
    _argExp(operand: Number | sql.Column): sql.Expression;
    eq(operand: Number): sql.Expression;
    neq(operand: Number): sql.Expression;
    lt(operand: Number): sql.Expression;
    gt(operand: Number): sql.Expression;
    lteq(operand: Number): sql.Expression;
    gteq(operand: Number): sql.Expression;
    and(operand: sql.Column): sql.Expression;
    or(operand: sql.Column): sql.Expression;
    not(): sql.Expression;
    in(...operand: Number[]): sql.Expression;
    between(first: Number, second: Number): sql.Expression;
    like(operand: Number): sql.Expression;
    IsNull(): sql.Expression;
    IsNotNull(): sql.Expression;
    plus(operand: Number): sql.Expression;
    minus(operand: Number): sql.Expression;
    multiply(operand: Number): sql.Expression;
    devide(operand: Number): sql.Expression;
    asc(): sql.Expression;
    desc(): sql.Expression;
    sum(): sql.Expression;
    min(): sql.Expression;
    max(): sql.Expression;
    count(): sql.Expression;
    average(): sql.Expression;
}
export default NumberType;
