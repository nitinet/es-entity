"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require("../sql");
function reverse(res, ...srcs) {
    srcs.forEach(src => {
        let allowKeys = Object.keys(src);
        Object.keys(src).filter((key) => {
            return allowKeys.includes(key)
                && src[key] instanceof sql.Field
                && res[key] != src[key].get();
        }).forEach((key) => {
            res[key] = src[key].get();
        });
    });
    return res;
}
exports.default = reverse;
//# sourceMappingURL=reverse.js.map