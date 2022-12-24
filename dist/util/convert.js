import * as sql from '../sql/index.js';
import * as types from '../types/index.js';
function convert(res, ...srcs) {
    let allowKeys = Object.keys(res);
    srcs.forEach(src => {
        Object.keys(src).filter((key) => {
            let resVal = Reflect.get(res, key);
            return allowKeys.includes(key)
                && src[key] != null
                && resVal instanceof sql.Field
                && resVal.get() != src[key];
        }).forEach((key) => {
            let resVal = Reflect.get(res, key);
            if (resVal instanceof types.Date) {
                let d = null;
                if (src[key] instanceof Date) {
                    d = src[key];
                }
                resVal.set(d);
            }
            else {
                resVal.set(src[key]);
            }
        });
    });
    return res;
}
export default convert;
