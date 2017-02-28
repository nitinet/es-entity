"use strict";
const Handler = require("./../Handler");
class PostGreHandler extends Handler.default {
    constructor(config) {
        super();
    }
    getConnection() {
        return null;
    }
    async getTableInfo(tableName) {
        return null;
    }
    async run(query) {
        return null;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PostGreHandler;
