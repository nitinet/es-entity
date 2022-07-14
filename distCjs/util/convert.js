"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require("../sql/index.js");
const types = require("../types/index.js");
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
exports.default = convert;
//# sourceMappingURL=convert.js.map