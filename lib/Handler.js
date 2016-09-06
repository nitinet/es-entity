"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
class ConnectionConfig {
    constructor() {
        this.name = "";
        this.handler = "";
        this.driver = null;
        this.connectionLimit = 25;
        this.hostname = "";
        this.username = "";
        this.password = "";
        this.database = "";
    }
}
exports.ConnectionConfig = ConnectionConfig;
class ResultSet {
    constructor() {
        this.rowCount = 0;
        this.id = null;
        this.rows = null;
        this.error = null;
    }
}
exports.ResultSet = ResultSet;
class ColumnInfo {
    constructor() {
        this.field = "";
        this.type = "";
        this.nullable = false;
        this.primaryKey = false;
        this.default = "";
        this.extra = "";
    }
}
exports.ColumnInfo = ColumnInfo;
class Handler {
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Handler;
