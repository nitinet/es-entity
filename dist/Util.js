"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverse = exports.convert = void 0;
const types = require("./types");
const sql = require("./sql");
const moment = require("moment");
function convert(res, ignoreKeys, ...srcs) {
    ignoreKeys || (ignoreKeys = []);
    srcs.forEach(src => {
        Reflect.ownKeys(src).filter((key) => {
            return !ignoreKeys.includes(key)
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
function reverse(res, ignoreKeys, ...srcs) {
    ignoreKeys || (ignoreKeys = []);
    srcs.forEach(src => {
        Reflect.ownKeys(src).filter((key) => {
            return !ignoreKeys.includes(key)
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