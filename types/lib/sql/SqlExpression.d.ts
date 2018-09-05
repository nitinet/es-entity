import Handler from '../Handler';
import Operator from './Operator';
import Column from './Column';
import ISqlNode from './ISqlNode';
import Field from './Field';

declare class SqlExpression extends ISqlNode implements Field<any> {
    args: Array<any>;
    _alias: string;
    _name: string;
    _updated: boolean;
    value: string;
    exps: Array<SqlExpression>;
    operator: Operator;
    constructor(value?: string, operator?: Operator, ...expressions: Array<SqlExpression>);
    add(...expressions: Array<SqlExpression>): SqlExpression;
    eval(handler: Handler): string;

    // Field extended methods
    _createExpr(): SqlExpression;
    _argExp(operand: any | Column): SqlExpression;
    eq(operand: any): SqlExpression;
    neq(operand: any): SqlExpression;
    lt(operand: any): SqlExpression;
    gt(operand: any): SqlExpression;
    lteq(operand: any): SqlExpression;
    gteq(operand: any): SqlExpression;
    and(operand: Column): SqlExpression;
    or(operand: Column): SqlExpression;
    not(): SqlExpression;
    in(...operand: any[]): SqlExpression;
    between(first: any, second: any): SqlExpression;
    like(operand: any): SqlExpression;
    IsNull(): SqlExpression;
    IsNotNull(): SqlExpression;
    plus(operand: any): SqlExpression;
    minus(operand: any): SqlExpression;
    multiply(operand: any): SqlExpression;
    devide(operand: any): SqlExpression;
    asc(): SqlExpression;
    desc(): SqlExpression;
    sum(): SqlExpression;
    min(): SqlExpression;
    max(): SqlExpression;
    count(): SqlExpression;
    average(): SqlExpression;
}
export default SqlExpression;
