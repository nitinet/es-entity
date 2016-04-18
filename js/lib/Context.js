/// <reference path="./../../typings/main/ambient/node/index.d.ts" />
"use strict";
const Reflect = require("harmony-reflect");
const Queryable_1 = require("./Queryable");
const Handler_1 = require("./Handler");
class Context {
    constructor(config, mappingPath) {
        this.mappingPath = mappingPath;
        this.setConfig(config);
        this.bind();
    }
    setConfig(config) {
        this.handler = Handler_1.default.getHandler(config);
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
    execute(query) {
        return this.handler.run(query);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Context;
