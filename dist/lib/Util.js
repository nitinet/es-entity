"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require("./sql");
function getCriteria() {
    return new sql.Expression();
}
exports.getCriteria = getCriteria;
