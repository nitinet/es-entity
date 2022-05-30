"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require("../sql");
class Converter {
    constructor(option) {
        this.option = null;
        this.option = option || {};
        this.option.ignoreKeys = option.ignoreKeys || [];
    }
    convert(res, ...srcs) {
        let allowKeys = this.option.allowKeys || Object.keys(res);
        allowKeys = allowKeys.filter(key => {
            return !this.option.ignoreKeys.includes(key);
        });
        srcs.forEach(src => {
            Object.keys(src).filter((key) => {
                return allowKeys.includes(key)
                    && src[key] != null
                    && res[key] instanceof sql.Field
                    && res[key].get() != src[key];
            }).forEach((key) => {
                let typeFunc = this.option.typeFuncs != null ? this.option.typeFuncs.get(res[key].constructor) : null;
                if (typeFunc && typeof typeFunc == 'function') {
                    res[key].set(typeFunc(src[key]));
                }
                else {
                    res[key].set(src[key]);
                }
            });
        });
        return res;
    }
    reverse(res, ...srcs) {
        let allowKeys = this.option.allowKeys || Object.keys(res);
        allowKeys = allowKeys.filter(key => {
            return !this.option.ignoreKeys.includes(key);
        });
        srcs.forEach(src => {
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
}
exports.default = Converter;
//# sourceMappingURL=Converter.js.map