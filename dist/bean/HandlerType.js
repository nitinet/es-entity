"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HandlerType;
(function (HandlerType) {
    HandlerType[HandlerType["NONE"] = 0] = "NONE";
    HandlerType[HandlerType["Mysql"] = 1] = "Mysql";
    HandlerType[HandlerType["PostgreSql"] = 2] = "PostgreSql";
    HandlerType[HandlerType["MsSqlServer"] = 3] = "MsSqlServer";
    HandlerType[HandlerType["Oracle"] = 4] = "Oracle";
    HandlerType[HandlerType["Sqlite"] = 5] = "Sqlite";
    HandlerType[HandlerType["Cassandra"] = 6] = "Cassandra";
})(HandlerType || (HandlerType = {}));
exports.default = HandlerType;
