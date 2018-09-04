import Handler from './Handler';
declare abstract class ISqlNode {
    args: Array<any>;
    abstract eval(handler: Handler): string;
}
declare class SqlStatement extends ISqlNode {
    command: string;
    columns: Array<ISqlNode>;
    values: Array<SqlExpression>;
    collection: SqlCollection;
    where: SqlExpression;
    groupBy: Array<SqlExpression>;
    orderBy: Array<SqlExpression>;
    limit: SqlExpression;
    constructor();
    eval(handler: Handler): string;
}
declare class SqlCollection extends ISqlNode {
    colAlias: string;
    value: string;
    stat: SqlStatement;
    alias: string;
    constructor();
    eval(handler: Handler): string;
}
declare abstract class Column {
    _alias: string;
    _name: string;
    _updated: boolean;
    abstract _createExpr(): SqlExpression;
    abstract _argExp(operand: any): SqlExpression;
    abstract eq(operand: any): SqlExpression;
    abstract neq(operand: any): SqlExpression;
    abstract lt(operand: any): SqlExpression;
    abstract gt(operand: any): SqlExpression;
    abstract lteq(operand: any): SqlExpression;
    abstract gteq(operand: any): SqlExpression;
    abstract and(operand: Column): SqlExpression;
    abstract or(operand: Column): SqlExpression;
    abstract not(): SqlExpression;
    abstract in(...operand: any[]): SqlExpression;
    abstract between(first: any, second: any): SqlExpression;
    abstract like(operand: any): SqlExpression;
    abstract IsNull(): SqlExpression;
    abstract IsNotNull(): SqlExpression;
    abstract plus(operand: any): SqlExpression;
    abstract minus(operand: any): SqlExpression;
    abstract multiply(operand: any): SqlExpression;
    abstract devide(operand: any): SqlExpression;
    abstract asc(): SqlExpression;
    abstract desc(): SqlExpression;
    abstract sum(): SqlExpression;
    abstract min(): SqlExpression;
    abstract max(): SqlExpression;
    abstract count(): SqlExpression;
    abstract average(): SqlExpression;
}
declare enum Operator {
    Equal = 1,
    NotEqual = 2,
    LessThan = 3,
    LessThanEqual = 4,
    GreaterThan = 5,
    GreaterThanEqual = 6,
    And = 7,
    Or = 8,
    Not = 9,
    Plus = 10,
    Minus = 11,
    Multiply = 12,
    Devide = 13,
    Between = 14,
    Exists = 15,
    In = 16,
    Like = 17,
    IsNull = 18,
    IsNotNull = 19,
    Asc = 20,
    Desc = 21,
    Limit = 22,
    Comma = 23,
    Count = 24,
    Sum = 25,
    Min = 26,
    Max = 27,
    Avg = 28
}
declare class Field<T> extends Column {
    _createExpr(): SqlExpression;
    _argExp(operand: T | Column): SqlExpression;
    eq(operand: T): SqlExpression;
    neq(operand: T): SqlExpression;
    lt(operand: T): SqlExpression;
    gt(operand: T): SqlExpression;
    lteq(operand: T): SqlExpression;
    gteq(operand: T): SqlExpression;
    and(operand: Column): SqlExpression;
    or(operand: Column): SqlExpression;
    not(): SqlExpression;
    in(...operand: T[]): SqlExpression;
    between(first: T, second: T): SqlExpression;
    like(operand: T): SqlExpression;
    IsNull(): SqlExpression;
    IsNotNull(): SqlExpression;
    plus(operand: T): SqlExpression;
    minus(operand: T): SqlExpression;
    multiply(operand: T): SqlExpression;
    devide(operand: T): SqlExpression;
    asc(): SqlExpression;
    desc(): SqlExpression;
    sum(): SqlExpression;
    min(): SqlExpression;
    max(): SqlExpression;
    count(): SqlExpression;
    average(): SqlExpression;
}
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
export { ISqlNode };
export { SqlStatement };
export { SqlCollection };
export { Column };
export { Operator };
export { Field };
export { SqlExpression };
