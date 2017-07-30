"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var ConnectionConfig = (function () {
    function ConnectionConfig() {
        this.name = "";
        this.handler = "";
        this.driver = null;
        this.connectionLimit = 25;
        this.hostname = ""; // Default Mysql
        this.username = "";
        this.password = "";
        this.database = "";
    }
    return ConnectionConfig;
}());
exports.ConnectionConfig = ConnectionConfig;
var ResultSet = (function () {
    function ResultSet() {
        this.rowCount = 0;
        this.id = null;
        this.rows = null;
        this.error = null;
    }
    return ResultSet;
}());
exports.ResultSet = ResultSet;
var ColumnInfo = (function () {
    function ColumnInfo() {
        this.field = "";
        this.type = "";
        this.nullable = false;
        this.primaryKey = false;
        this["default"] = "";
        this.extra = "";
    }
    return ColumnInfo;
}());
exports.ColumnInfo = ColumnInfo;
var Handler = (function () {
    function Handler() {
        this.handlerName = '';
    }
    Handler.prototype.getTableInfo = function (tableName) { return null; };
    Handler.prototype.run = function (query, args, connetction) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, null];
        }); });
    };
    // Connetion mange functions
    Handler.prototype.getConnection = function () { return null; };
    Handler.prototype.openConnetion = function (conn) { return null; };
    Handler.prototype.initTransaction = function (conn) { return null; };
    Handler.prototype.commit = function (conn) { return null; };
    Handler.prototype.rollback = function (conn) { return null; };
    Handler.prototype.close = function (conn) { return null; };
    // Comparison Operators
    Handler.prototype.eq = function (val0, val1) { return val0 + " = " + val1; };
    Handler.prototype.neq = function (val0, val1) { return val0 + " != " + val1; };
    Handler.prototype.lt = function (val0, val1) { return val0 + " < " + val1; };
    Handler.prototype.gt = function (val0, val1) { return val0 + " > " + val1; };
    Handler.prototype.lteq = function (val0, val1) { return val0 + " <= " + val1; };
    Handler.prototype.gteq = function (val0, val1) { return val0 + " >= " + val1; };
    // Logical Operators
    Handler.prototype.and = function (values) {
        var r = "(" + values[0];
        for (var i = 1; i < values.length; i++) {
            r = r + ") and (" + values[i];
        }
        r = r + ")";
        return r;
    };
    Handler.prototype.or = function (values) {
        var r = "(" + values[0];
        for (var i = 1; i < values.length; i++) {
            r = r + ") or (" + values[i];
        }
        r = r + ")";
        return r;
    };
    Handler.prototype.not = function (val0) { return " not " + val0; };
    // Inclusion Funtions
    Handler.prototype["in"] = function (val0, val1) { return val0 + " in (" + val1 + ")"; };
    Handler.prototype.between = function (values) { return values[0] + " between " + values[1] + " and " + values[2]; };
    Handler.prototype.like = function (val0, val1) { return val0 + " like " + val1; };
    Handler.prototype.isNull = function (val0) { return val0 + " is null"; };
    Handler.prototype.isNotNull = function (val0) { return val0 + " is not null"; };
    Handler.prototype.exists = function (val0) { return " exists (" + val0 + ")"; };
    Handler.prototype.limit = function (val0, val1) { return " limit " + val0 + (val1 ? "," + val1 : ""); };
    // Arithmatic Operators
    Handler.prototype.plus = function (val0, val1) { return val0 + " + " + val1; };
    Handler.prototype.minus = function (val0, val1) { return val0 + " - " + val1; };
    Handler.prototype.multiply = function (val0, val1) { return val0 + " * " + val1; };
    Handler.prototype.devide = function (val0, val1) { return val0 + " / " + val1; };
    // Sorting Operators
    Handler.prototype.asc = function (val0) { return val0 + " asc"; };
    Handler.prototype.desc = function (val0) { return val0 + " desc"; };
    // Group Functions
    Handler.prototype.sum = function (val0) { return "sum(" + val0 + ")"; };
    Handler.prototype.min = function (val0) { return "min(" + val0 + ")"; };
    Handler.prototype.max = function (val0) { return "max(" + val0 + ")"; };
    Handler.prototype.count = function (val0) { return "count(" + val0 + ")"; };
    Handler.prototype.average = function (val0) { return "avg(" + val0 + ")"; };
    return Handler;
}());
exports["default"] = Handler;
