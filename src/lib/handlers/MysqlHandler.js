"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var mysql = require("mysql");
var util = require("../Util");
var Handler = require("./../Handler");
var Query = require("./../Query");
var Connection_1 = require("../Connection");
var MysqlHandler = (function (_super) {
    __extends(MysqlHandler, _super);
    function MysqlHandler(config) {
        var _this = _super.call(this) || this;
        _this.handlerName = 'mysql';
        _this.connectionPool = null;
        _this.config = config;
        _this.connectionPool = mysql.createPool({
            connectionLimit: _this.config.connectionLimit,
            host: _this.config.hostname,
            user: _this.config.username,
            password: _this.config.password,
            database: _this.config.database
        });
        return _this;
    }
    MysqlHandler.prototype.getConnection = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var conn = mysql.createConnection({
                host: _this.config.hostname,
                user: _this.config.username,
                password: _this.config.password,
                database: _this.config.database
            });
            conn.connect(function (err) {
                if (err)
                    reject(err);
                else {
                    var res = new Connection_1["default"](_this, conn);
                    resolve(res);
                }
            });
        });
    };
    MysqlHandler.prototype.openConnetion = function (conn) {
        var _this = this;
        var p = new Promise(function (resolve, reject) {
            conn = mysql.createConnection({
                host: _this.config.hostname,
                user: _this.config.username,
                password: _this.config.password,
                database: _this.config.database
            });
            conn.connect(function (err) {
                if (err)
                    reject(err);
                else
                    resolve(conn);
            });
        });
        return p;
    };
    MysqlHandler.prototype.initTransaction = function (conn) {
        var p = new Promise(function (resolve, reject) {
            conn.beginTransaction(function (err) {
                if (err)
                    reject('Initializing Transaction Failed');
                else
                    resolve();
            });
        });
        return p;
    };
    MysqlHandler.prototype.commit = function (conn) {
        var p = new Promise(function (resolve, reject) {
            conn.commit(function (err) {
                if (err)
                    reject('Initializing Transaction Failed');
                else
                    resolve();
            });
        });
        return p;
    };
    MysqlHandler.prototype.rollback = function (conn) {
        var p = new Promise(function (resolve) {
            conn.rollback(function () {
                resolve();
            });
        });
        return p;
    };
    MysqlHandler.prototype.close = function (conn) {
        var p = new Promise(function (resolve, reject) {
            conn.end(function (err) {
                if (err)
                    reject('Initializing Transaction Failed');
                else
                    resolve();
            });
        });
        return p;
    };
    MysqlHandler.prototype.getTableInfo = function (tableName) {
        var p = this.run("describe " + tableName);
        var r = util.deAsync(p);
        var result = new Array();
        r.rows.forEach(function (row) {
            var a = new Handler.ColumnInfo();
            a.field = row["Field"];
            var columnType = row["Type"].toLowerCase();
            if (columnType.includes("tinyint(1)")) {
                a.type = "boolean";
            }
            else if (columnType.includes("int")
                || columnType.includes("float")
                || columnType.includes("double")
                || columnType.includes("decimal")) {
                a.type = "number";
            }
            else if (columnType.includes("varchar")
                || columnType.includes('text')) {
                a.type = "string";
            }
            else if (columnType.includes("timestamp")) {
                a.type = "date";
            }
            a.nullable = row["Null"] == "YES" ? true : false;
            a.primaryKey = row["Key"].indexOf("PRI") >= 0 ? true : false;
            a["default"] = row["Default"];
            a.extra = row["Extra"];
            result.push(a);
        });
        return result;
    };
    MysqlHandler.prototype.run = function (query, args, connection) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var q, p;
            return __generator(this, function (_a) {
                q = null;
                if (typeof query === "string") {
                    q = query;
                }
                else if (query instanceof Query.SqlStatement) {
                    q = query.eval(this);
                    args = query.args;
                }
                p = new Promise(function (resolve, reject) {
                    return Promise.resolve(q).then(function (val) {
                        // console.log("query:" + val);
                        /* for (let i = 0; i < args.length; i++) {
                                console.log("Argument: " + args[i]);
                        }*/
                        var r = new Handler.ResultSet();
                        if (connection && connection instanceof Connection_1["default"] && connection.Handler.handlerName == _this.handlerName && connection.conn) {
                            connection.conn.query(val, args, function (err, result) {
                                if (err)
                                    reject(err);
                                else {
                                    if (result.insertId)
                                        r.id = result.insertId;
                                    if (result.changedRows) {
                                        r.rowCount = result.changedRows;
                                    }
                                    else if (Array.isArray(result)) {
                                        r.rows = result;
                                        r.rowCount = result.length;
                                    }
                                }
                                resolve(r);
                            });
                        }
                        else {
                            _this.connectionPool.query(val, args, function (err, result) {
                                if (err)
                                    reject(err);
                                else {
                                    if (result.insertId)
                                        r.id = result.insertId;
                                    if (result.changedRows) {
                                        r.rowCount = result.changedRows;
                                    }
                                    else if (Array.isArray(result)) {
                                        r.rows = result;
                                        r.rowCount = result.length;
                                    }
                                }
                                resolve(r);
                            });
                        }
                    });
                });
                return [2 /*return*/, p];
            });
        });
    };
    return MysqlHandler;
}(Handler["default"]));
exports["default"] = MysqlHandler;
