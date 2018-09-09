import * as sql from '../sql/Expression';
declare class NumberType extends sql.Field<number> implements Number {
    constructor(data?: number);
    set(value: number | Number): void;
    toString(radix?: number): string;
    toFixed(fractionDigits?: number): string;
    toExponential(fractionDigits?: number): string;
    toPrecision(precision?: number): string;
    valueOf(): number;
}
export default NumberType;
