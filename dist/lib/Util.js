"use strict";
const Type = require("./Type");
const deasync = require("deasync");
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
                    if (target[key] instanceof Type.Date) {
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
function deAsync(promise) {
    var res, error, done = false;
    promise.then(function (res) {
        res = res;
    }, function (err) {
        error = err;
    }).then(function () {
        done = true;
    });
    deasync.loopWhile(function () { return !done; });
    if (error) {
        throw error;
    }
    return res;
}
exports.deAsync = deAsync;
