"use strict";
class Loader {
    constructor() {
    }
    static load(contextType, mappingPath) {
        let context = new contextType();
        context.mappingPath = mappingPath;
        return context;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Loader;
