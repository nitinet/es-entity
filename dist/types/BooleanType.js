import Field from '../sql/Field';
import * as bean from '../bean';
class BooleanType extends Field {
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
                return BooleanType.prototype;
            }
        });
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
//# sourceMappingURL=BooleanType.js.map