import Field from '../sql/Field';
import * as bean from '../bean';
class NumberType extends Field {
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
                return NumberType.prototype;
            }
        });
    }
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (typeof value == 'number') {
            super.set(value);
        }
        else {
            throw new bean.SqlException('Invalid Number Value');
        }
    }
}
export default NumberType;
//# sourceMappingURL=NumberType.js.map