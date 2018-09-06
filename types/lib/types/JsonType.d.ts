import * as sql from '../sql';
declare class JsonType extends sql.Field<string> {
    private _value;
    constructor(data?: string);
    get(): any;
    set(value: any): void;
    toJSON(): any;
}
export default JsonType;
