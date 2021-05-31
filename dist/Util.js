"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverse = exports.convert = void 0;
const types = require("./types");
const sql = require("./sql");
const moment = require("moment");
function convert(res, option, ...srcs) {
    if (srcs == null || srcs.length == 0) {
        srcs = [option];
        option = null;
    }
    option = option || {};
    option.ignoreKeys = option.ignoreKeys || [];
    srcs.forEach(src => {
        let allowKeys = option.allowKeys ?? Reflect.ownKeys(src);
        Reflect.ownKeys(src).filter((key) => {
            return allowKeys.includes(key)
                && !option.ignoreKeys.includes(key)
                && src[key] != null
                && res[key] instanceof sql.Field
                && res[key].get() != src[key];
        }).forEach((key) => {
            if (res[key] instanceof types.Date) {
                let d = moment(src[key]);
                res[key].set(d.toDate());
            }
            else {
                res[key].set(src[key]);
            }
        });
    });
    return res;
}
exports.convert = convert;
function reverse(res, option, ...srcs) {
    if (srcs == null || srcs.length == 0) {
        srcs = [option];
        option = null;
    }
    option = option || {};
    option.ignoreKeys = option.ignoreKeys || [];
    srcs.forEach(src => {
        let allowKeys = option.allowKeys ?? Reflect.ownKeys(src);
        Reflect.ownKeys(src).filter((key) => {
            return allowKeys.includes(key)
                && !option.ignoreKeys.includes(key)
                && src[key] instanceof sql.Field
                && res[key] != src[key].get();
        }).forEach((key) => {
            res[key] = src[key].get();
        });
    });
    return res;
}
exports.reverse = reverse;
//# sourceMappingURL=util.js.map