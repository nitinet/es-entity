import Field from '../sql/Field';
import * as bean from '../bean';
class DateType extends Field {
    constructor(data) {
        super();
        this.set(data);
        return new Proxy(this, {
            get(target, prop) {
                if (prop in target) {
                    return target[prop];
                }
                else if (target._value) {
                    return target._value[prop];
                }
            },
            getPrototypeOf() {
                return DateType.prototype;
            }
        });
    }
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (value instanceof Date) {
            super.set(value);
        }
        else {
            throw new bean.SqlException('Invalid Date Value');
        }
    }
}
export default DateType;
//# sourceMappingURL=DateType.js.map