import * as Query from './Query';
export interface IEntityType<T> {
    new (): T;
}
declare class JsonField extends Query.Field<string> {
    private _value;
    constructor(data?: string);
    get(): any;
    set(value: any): void;
    toJSON(): any;
}
declare interface StringField extends String, Query.Field<String> {
    set(value: string | String): void;
}
declare interface NumberField extends Number, Query.Field<Number> {
    set(value: number | Number): void;
}
declare interface BooleanField extends Boolean, Query.Field<Boolean> {
    set(value: boolean): void;
}
declare interface DateField extends Date, Query.Field<Date> {
    constructor(data?: Date);
    set(value: Date): void;
}
export { JsonField as Json };
export { StringField as String };
export { NumberField as Number };
export { BooleanField as Boolean };
export { DateField as Date };
