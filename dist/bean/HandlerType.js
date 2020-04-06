"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HandlerType;
(function (HandlerType) {
    HandlerType["none"] = "NONE";
    HandlerType["mysql"] = "MYSQL";
    HandlerType["postgresql"] = "POSTGRESQL";
    HandlerType["mssql"] = "MSSQL";
    HandlerType["oracle"] = "ORACLE";
    HandlerType["sqlite"] = "SQLITE";
    HandlerType["cassandra"] = "CASSANDRA";
})(HandlerType || (HandlerType = {}));
exports.default = HandlerType;
