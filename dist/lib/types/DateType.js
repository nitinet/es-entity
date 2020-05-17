import * as sql from '../sql/Expression';
class DateType extends sql.Field {
    constructor(data) {
        super();
        if (data instanceof Date) {
            this._value = data;
        }
        else {
            this._value = new Date(data);
        }
        return new Proxy(this, {
            get(target, prop) {
                if (prop in target) {
                    return target[prop];
                }
                else if (prop in target._value) {
                    return target._value[prop];
                }
            },
            getPrototypeOf() {
                return sql.Field.prototype;
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
    }
}
export default DateType;
//# sourceMappingURL=DateType.js.map