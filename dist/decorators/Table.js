import { TABLE_KEY } from './Constants.js';
function Table(name) {
    return function (target) {
        let val = name ?? target.name;
        return Reflect.defineMetadata(TABLE_KEY, val, target);
    };
}
export default Table;
//# sourceMappingURL=Table.js.map