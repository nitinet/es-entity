import * as Query from './Query';
export interface IEntityType<T> {
    new(): T;
}
declare class JsonField extends Query.Field<string> {
    private _value;
    constructor(data?: string);
    get(): any;
    set(value: any): void;
    toJSON(): any;
}
declare class StringField extends String implements Query.Field<String> {
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
declare class NumberField extends Number implements Query.Field<Number> {
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
declare class BooleanField extends Boolean implements Query.Field<Boolean> {
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
declare class DateField extends Date implements Query.Field<Date> {
    set(value: Date): void;

    // Field extended Methods
    _alias: string;
    _name: string;
    _updated: boolean;
    _createExpr(): Query.SqlExpression;
    _argExp(operand: Date | Query.Column): Query.SqlExpression;
    eq(operand: Date): Query.SqlExpression;
    neq(operand: Date): Query.SqlExpression;
    lt(operand: Date): Query.SqlExpression;
    gt(operand: Date): Query.SqlExpression;
    lteq(operand: Date): Query.SqlExpression;
    gteq(operand: Date): Query.SqlExpression;
    and(operand: Query.Column): Query.SqlExpression;
    or(operand: Query.Column): Query.SqlExpression;
    not(): Query.SqlExpression;
    in(...operand: Date[]): Query.SqlExpression;
    between(first: Date, second: Date): Query.SqlExpression;
    like(operand: Date): Query.SqlExpression;
    IsNull(): Query.SqlExpression;
    IsNotNull(): Query.SqlExpression;
    plus(operand: Date): Query.SqlExpression;
    minus(operand: Date): Query.SqlExpression;
    multiply(operand: Date): Query.SqlExpression;
    devide(operand: Date): Query.SqlExpression;
    asc(): Query.SqlExpression;
    desc(): Query.SqlExpression;
    sum(): Query.SqlExpression;
    min(): Query.SqlExpression;
    max(): Query.SqlExpression;
    count(): Query.SqlExpression;
    average(): Query.SqlExpression;
}
export { JsonField as Json };
export { StringField as String };
export { NumberField as Number };
export { BooleanField as Boolean };
export { DateField as Date };
