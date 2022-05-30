import Field from '../sql/Field';
import * as bean from '../bean';
class BooleanType extends Field {
    constructor(data) {
        super();
        this.set(data);
    }
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (typeof value == 'boolean') {
            super.set(!!value);
        }
        else {
            throw new bean.SqlException('Invalid Boolean Value');
        }
    }
}
export default BooleanType;
