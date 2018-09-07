"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types = require("./types");
class PropertyTransformer {
    constructor() {
        this.fields = new Array();
    }
    assignObject(source, target) {
        if (!target) {
            target = {};
        }
        Reflect.ownKeys(source).forEach(key => {
            let value = source[key.toString()].get();
            target[key.toString()] = value;
        });
        return target;
    }
    assignEntity(target, ...sources) {
        sources.forEach(source => {
            let keys = Reflect.ownKeys(source);
            keys.forEach(key => {
                if (this.fields.indexOf(key.toString()) != -1 && Reflect.has(target, key)) {
                    let value = Reflect.get(source, key);
                    if (target[key] instanceof types.Date) {
                        target[key].set(new Date(value));
                    }
                    else {
                        target[key].set(value);
                    }
                }
            });
        });
        return target;
    }
}
exports.PropertyTransformer = PropertyTransformer;
