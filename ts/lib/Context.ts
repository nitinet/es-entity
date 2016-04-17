/// <reference path="./../../typings/main/ambient/node/index.d.ts" />

import fs = require("fs");
import Reflect = require("harmony-reflect");

import Queryable from "./Queryable";

interface IContextType<T extends Context> {
    new (): T;
}

class Context {
    mappingPath: string;
    config: any;
    constructor(config?: any, mappingPath?: string) {
        this.config = config;
        this.mappingPath = mappingPath;
    }

    setConfig(config: any): void {
        this.config = config;
    }

    bind(): void {
        let keys: string[] = Reflect.ownKeys(this);
        keys.forEach(key => {
            let e: Queryable = Reflect.get(this, key);
            if (e instanceof Queryable) {
                e.bind(this);
            }
        });
    }

}

export default Context;
export {IContextType};
