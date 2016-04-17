/// <reference path="./../../typings/main/ambient/node/index.d.ts" />
"use strict";
const Reflect = require("harmony-reflect");
const Queryable_1 = require("./Queryable");
class Context {
    constructor(config, mappingPath) {
        this.config = config;
        this.mappingPath = mappingPath;
    }
    setConfig(config) {
        this.config = config;
    }
    bind() {
        let keys = Reflect.ownKeys(this);
        keys.forEach(key => {
            let e = Reflect.get(this, key);
            if (e instanceof Queryable_1.default) {
                e.bind(this);
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Context;
