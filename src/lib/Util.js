"use strict";
exports.__esModule = true;
var Type = require("./Type");
var deasync = require("deasync");
var PropertyTransformer = (function () {
    function PropertyTransformer() {
        this.fields = new Array();
    }
    PropertyTransformer.prototype.assignObject = function (source, target) {
        if (!target) {
            target = {};
        }
        Reflect.ownKeys(source).forEach(function (key) {
            var value = source[key.toString()].get();
            target[key.toString()] = value;
        });
        return target;
    };
    PropertyTransformer.prototype.assignEntity = function (target) {
        var _this = this;
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        sources.forEach(function (source) {
            var keys = Reflect.ownKeys(source);
            keys.forEach(function (key) {
                if (_this.fields.indexOf(key.toString()) != -1 && Reflect.has(target, key)) {
                    var value = Reflect.get(source, key);
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
    };
    return PropertyTransformer;
}());
exports.PropertyTransformer = PropertyTransformer;
function deAsync(promise) {
    var result, error, done = false;
    promise.then(function (res) {
        result = res;
    }, function (err) {
        error = err;
    }).then(function () {
        done = true;
    });
    deasync.loopWhile(function () { return !done; });
    if (error) {
        throw error;
    }
    return result;
}
exports.deAsync = deAsync;
