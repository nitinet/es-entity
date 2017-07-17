"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Handler = require("./../Handler");
class OracleDbHandler extends Handler.default {
    constructor(config) {
        super();
        this.handlerName = 'oracle';
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
exports.default = OracleDbHandler;
