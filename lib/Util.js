"use strict";
const Type = require("./Type");
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
                if (this.fields.indexOf(key.toString()) != -1 && Reflect.has(target, key.toString())) {
                    let value = Reflect.get(source, key);
                    if (target[key.toString()] instanceof Type.Date) {
                        target[key.toString()].set(new Date(value));
                    }
                    else {
                        target[key.toString()].set(value);
                    }
                }
            });
        });
        return target;
    }
}
exports.PropertyTransformer = PropertyTransformer;
