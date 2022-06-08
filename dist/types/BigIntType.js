import Field from '../sql/Field.js';
import * as bean from '../bean/index.js';
class BigIntType extends Field {
    constructor(data) {
        super();
        this.set(data);
    }
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (typeof value == 'bigint') {
            super.set(value);
        }
        else if (typeof value == 'number' || typeof value == 'string') {
            super.set(BigInt(value));
        }
        else {
            throw new bean.SqlException('Invalid BigInt Value: ' + value);
        }
    }
}
export default BigIntType;
