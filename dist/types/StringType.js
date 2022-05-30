import Field from '../sql/Field';
import * as bean from '../bean';
class StringType extends Field {
    constructor(data) {
        super();
        this.set(data);
    }
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (typeof value == 'string') {
            super.set(value);
        }
        else {
            throw new bean.SqlException('Invalid String Value');
        }
    }
}
export default StringType;
//# sourceMappingURL=StringType.js.map