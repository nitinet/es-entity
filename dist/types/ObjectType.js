import Field from '../sql/Field';
import * as bean from '../bean';
class ObjectType extends Field {
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
                return ObjectType.prototype;
            }
        });
    }
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (typeof value == 'object') {
            super.set(value);
        }
        else {
            throw new bean.SqlException('Invalid Object Value');
        }
    }
}
export default ObjectType;
//# sourceMappingURL=ObjectType.js.map