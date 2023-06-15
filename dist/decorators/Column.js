import { COLUMN_KEY } from './Constants.js';
function Column(name) {
    return function (target, property) {
        let val = name ?? property;
        return Reflect.defineMetadata(COLUMN_KEY, val, target, property);
    };
}
export default Column;
//# sourceMappingURL=Column.js.map