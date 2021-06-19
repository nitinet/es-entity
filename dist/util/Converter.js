"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverse = exports.convert = void 0;
const types = require("../types");
const sql = require("../sql");
class Converter {
    constructor(option) {
        this.option = null;
        this.option = option || {};
        this.option.ignoreKeys = option.ignoreKeys || [];
    }
    convert(res, ...srcs) {
        srcs.forEach(src => {
            let allowKeys = this.option.allowKeys ?? Object.keys(src);
            Object.keys(src).filter((key) => {
                return allowKeys.includes(key)
                    && !this.option.ignoreKeys.includes(key)
                    && src[key] != null
                    && res[key] instanceof sql.Field
                    && res[key].get() != src[key];
            }).forEach((key) => {
                if (res[key] instanceof types.Date) {
                    let d = null;
                    if (this.option.dateFunc) {
                        d = this.option.dateFunc(src[key]);
                    }
                    else if (src[key] instanceof Date) {
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
    reverse(res, ...srcs) {
        srcs.forEach(src => {
            let allowKeys = this.option.allowKeys ?? Object.keys(src);
            Object.keys(src).filter((key) => {
                return allowKeys.includes(key)
                    && !this.option.ignoreKeys.includes(key)
                    && src[key] instanceof sql.Field
                    && res[key] != src[key].get();
            }).forEach((key) => {
                res[key] = src[key].get();
            });
        });
        return res;
    }
}
function convert(res, ...srcs) {
    srcs.forEach(src => {
        let allowKeys = Object.keys(src);
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
exports.convert = convert;
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
exports.reverse = reverse;
exports.default = Converter;
//# sourceMappingURL=Converter.js.map