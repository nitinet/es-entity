import * as sql from '../sql/Expression';
declare class JsonType extends sql.Field<string> {
    constructor(data?: string);
    get(): any;
    set(value: any): void;
    toJSON(): any;
}
export default JsonType;
