import * as sql from '../sql/Expression';
declare class BooleanType extends sql.Field<boolean> implements Boolean {
    constructor(data?: boolean);
    set(value: boolean | Boolean): void;
    valueOf(): boolean;
}
export default BooleanType;
