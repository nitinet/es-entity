import * as sql from '../sql';
import * as types from '../types';
function convert(res, ...srcs) {
    let allowKeys = Object.keys(res);
    srcs.forEach(src => {
        Object.keys(src).filter((key) => {
            return allowKeys.includes(key)
                && src[key] != null
                && res[key] instanceof sql.Field
                && res[key].get() != src[key];
        }).forEach((key) => {
            if (res[key] instanceof types.Date) {
                let d = null;
                if (src[key] instanceof Date) {
                    d = src[key];
                }
                res[key].set(d);
            }
            else {
                res[key].set(src[key]);
            }
        });
    });
    return res;
}
export default convert;
