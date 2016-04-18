"use strict";
var QueryType;
(function (QueryType) {
    QueryType[QueryType["statement"] = 0] = "statement";
    QueryType[QueryType["command"] = 1] = "command";
    QueryType[QueryType["columns"] = 2] = "columns";
    QueryType[QueryType["collection"] = 3] = "collection";
    QueryType[QueryType["where"] = 4] = "where";
    QueryType[QueryType["sets"] = 5] = "sets";
    QueryType[QueryType["expression"] = 6] = "expression";
})(QueryType || (QueryType = {}));
exports.QueryType = QueryType;
class Query {
    constructor() {
        this.type = QueryType.statement;
        this.value = "";
        this.nodes = new Array();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Query;
