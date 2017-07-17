"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Handler = require("./../Handler");
class PostGreHandler extends Handler.default {
    constructor(config) {
        super();
        this.handlerName = 'postgre';
        this.driver = null;
    }
    getConnection() {
        return null;
    }
    getTableInfo(tableName) {
        return null;
    }
    async run(query) {
        return null;
    }
}
exports.default = PostGreHandler;
