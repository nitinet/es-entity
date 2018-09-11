"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HandlerType;
(function (HandlerType) {
    HandlerType[HandlerType["none"] = 0] = "none";
    HandlerType[HandlerType["mysql"] = 1] = "mysql";
    HandlerType[HandlerType["postgresql"] = 2] = "postgresql";
    HandlerType[HandlerType["mssql"] = 3] = "mssql";
    HandlerType[HandlerType["oracle"] = 4] = "oracle";
    HandlerType[HandlerType["sqlite"] = 5] = "sqlite";
    HandlerType[HandlerType["cassandra"] = 6] = "cassandra";
})(HandlerType || (HandlerType = {}));
exports.default = HandlerType;
