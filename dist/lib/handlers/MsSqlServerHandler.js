"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Handler = require("./../Handler");
class MsSqlServerHandler extends Handler.default {
    constructor(config) {
        super();
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
exports.default = MsSqlServerHandler;
