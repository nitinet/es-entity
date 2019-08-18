"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Handler_1 = require("../lib/Handler");
class Oracle extends Handler_1.default {
    constructor(config) {
        super();
        this.handlerName = 'oracle';
        this.driver = null;
    }
    async init() { }
    async getConnection() { return null; }
    async openConnetion(conn) { return null; }
    async initTransaction(conn) { return null; }
    async commit(conn) { return null; }
    async rollback(conn) { return null; }
    async close(conn) { return null; }
    async end() { return null; }
    async getTableInfo(tableName) {
        return null;
    }
    async run(query) {
        return null;
    }
}
exports.default = Oracle;
