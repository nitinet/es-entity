import Handler from '../Handler';
import Operator from './Operator';
import Column from './Column';
import INode from './INode';
import Field from './Field';

declare class Expression extends INode implements Field<any> {
    args: Array<any>;
    _alias: string;
    _name: string;
    _updated: boolean;
    value: string;
    exps: Array<Expression>;
    operator: Operator;
    constructor(value?: string, operator?: Operator, ...expressions: Array<Expression>);
    add(...expressions: Array<Expression>): Expression;
    eval(handler: Handler): string;

    // Field extended methods
    _createExpr(): Expression;
    _argExp(operand: any | Column): Expression;
    eq(operand: any): Expression;
    neq(operand: any): Expression;
    lt(operand: any): Expression;
    gt(operand: any): Expression;
    lteq(operand: any): Expression;
    gteq(operand: any): Expression;
    and(operand: Column): Expression;
    or(operand: Column): Expression;
    not(): Expression;
    in(...operand: any[]): Expression;
    between(first: any, second: any): Expression;
    like(operand: any): Expression;
    IsNull(): Expression;
    IsNotNull(): Expression;
    plus(operand: any): Expression;
    minus(operand: any): Expression;
    multiply(operand: any): Expression;
    devide(operand: any): Expression;
    asc(): Expression;
    desc(): Expression;
    sum(): Expression;
    min(): Expression;
    max(): Expression;
    count(): Expression;
    average(): Expression;
}
export default Expression;
