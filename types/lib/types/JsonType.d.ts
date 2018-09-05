import * as Query from '../Query';
declare class JsonType extends Query.Field<string> {
    private _value;
    constructor(data?: string);
    get(): any;
    set(value: any): void;
    toJSON(): any;
}
export default JsonType;
