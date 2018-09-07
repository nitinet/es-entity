"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Handler_1 = require("../lib/Handler");
class Oracle extends Handler_1.default {
    constructor(config) {
        super();
        this.handlerName = 'oracle';
        this.driver = null;
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
exports.default = Oracle;
