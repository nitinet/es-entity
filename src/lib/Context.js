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
var Queryable_1 = require("./Queryable");
var MysqlHandler_1 = require("./handlers/MysqlHandler");
var OracleDbHandler_1 = require("./handlers/OracleDbHandler");
var MsSqlServerHandler_1 = require("./handlers/MsSqlServerHandler");
var PostGreHandler_1 = require("./handlers/PostGreHandler");
var SqlLiteHandler_1 = require("./handlers/SqlLiteHandler");
var Query = require("./Query");
function getHandler(config) {
    var handler = null;
    if (config.handler.toLowerCase() === "mysql") {
        handler = new MysqlHandler_1["default"](config);
    }
    else if (config.handler.toLowerCase() === "oracle") {
        handler = new OracleDbHandler_1["default"](config);
    }
    else if (config.handler.toLowerCase() === "postgre") {
        handler = new PostGreHandler_1["default"](config);
    }
    else if (config.handler.toLowerCase() === "sqlserver") {
        handler = new MsSqlServerHandler_1["default"](config);
    }
    else if (config.handler.toLowerCase() === "sqllite") {
        handler = new SqlLiteHandler_1["default"](config);
    }
    else {
        throw "No Handler Found";
    }
    return handler;
}
exports.getHandler = getHandler;
var Context = (function () {
    function Context(config, entityPath) {
        this.connection = null;
        if (config) {
            this.setConfig(config);
        }
        if (entityPath) {
            this.setEntityPath(entityPath);
        }
    }
    Context.prototype.init = function () {
        var keys = Reflect.ownKeys(this);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var e = Reflect.get(this, key);
            if (e instanceof Queryable_1.DBSet) {
                e.bind(this);
            }
        }
    };
    Context.prototype.setConfig = function (config) {
        this.handler = getHandler(config);
    };
    Context.prototype.setEntityPath = function (entityPath) {
        this.entityPath = entityPath;
    };
    Context.prototype.execute = function (query, args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.handler.run(query, args, this.connection)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Context.prototype.getCriteria = function () {
        return new Query.SqlExpression();
    };
    Context.prototype.flush = function () { };
    Context.prototype.initTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res, keys, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        res = this;
                        // Create Clone if connection not present
                        if (!this.connection) {
                            res = Object.assign({}, this);
                            Object.setPrototypeOf(res, Object.getPrototypeOf(this));
                            keys = Reflect.ownKeys(res);
                            keys.forEach(function (key) {
                                var prop = Reflect.get(res, key);
                                if (prop instanceof Queryable_1.DBSet) {
                                    prop.context = res;
                                }
                            });
                        }
                        _a = res;
                        return [4 /*yield*/, res.handler.getConnection()];
                    case 1:
                        _a.connection = _b.sent();
                        return [4 /*yield*/, res.connection.initTransaction()];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, res];
                }
            });
        });
    };
    Context.prototype.commit = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connection.commit()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.connection.close()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Context.prototype.rollback = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connection.rollback()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.connection.close()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Context;
}());
exports["default"] = Context;
