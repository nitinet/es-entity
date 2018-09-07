import * as sql from '../sql';
declare class DateType extends Date implements sql.Field<Date> {
    set(value: Date): void;

    // Field extended Methods
    _alias: string;
    _name: string;
    _updated: boolean;
    _createExpr(): sql.Expression;
    _argExp(operand: Date | sql.Column): sql.Expression;
    eq(operand: Date): sql.Expression;
    neq(operand: Date): sql.Expression;
    lt(operand: Date): sql.Expression;
    gt(operand: Date): sql.Expression;
    lteq(operand: Date): sql.Expression;
    gteq(operand: Date): sql.Expression;
    and(operand: sql.Column): sql.Expression;
    or(operand: sql.Column): sql.Expression;
    not(): sql.Expression;
    in(...operand: Date[]): sql.Expression;
    between(first: Date, second: Date): sql.Expression;
    like(operand: Date): sql.Expression;
    IsNull(): sql.Expression;
    IsNotNull(): sql.Expression;
    plus(operand: Date): sql.Expression;
    minus(operand: Date): sql.Expression;
    multiply(operand: Date): sql.Expression;
    devide(operand: Date): sql.Expression;
    asc(): sql.Expression;
    desc(): sql.Expression;
    sum(): sql.Expression;
    min(): sql.Expression;
    max(): sql.Expression;
    count(): sql.Expression;
    average(): sql.Expression;
}
export default DateType;
