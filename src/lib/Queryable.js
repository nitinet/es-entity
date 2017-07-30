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
var fs = require("fs");
var path = require("path");
var Case = require("case");
var Type = require("./Type");
var Mapping = require("./Mapping");
var Query = require("./Query");
var DBSet = (function () {
    function DBSet(entityType) {
        this.mapping = new Mapping.EntityMapping();
        this.entityType = entityType;
    }
    DBSet.prototype.bind = function (context) {
        this.context = context;
        var entityName = this.entityType.name;
        var filePath = null;
        if (this.context.entityPath) {
            filePath = path.join(this.context.entityPath, entityName + ".json");
        }
        if (filePath && fs.statSync(filePath).isFile()) {
            var data = fs.readFileSync(filePath, "utf-8");
            this.mapping = new Mapping.EntityMapping(JSON.parse(data));
        }
        else {
            this.mapping = new Mapping.EntityMapping();
            this.mapping.entityName = entityName;
            this.mapping.name = Case.snake(entityName);
            // get info from describe db
            var columns = this.context.handler.getTableInfo(this.mapping.name);
            var a = new this.entityType();
            var keys = Reflect.ownKeys(a);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var f = a[key];
                if (f instanceof Type.Field) {
                    var name_1 = Case.snake(key.toString());
                    var column = null;
                    for (var j = 0; j < columns.length; j++) {
                        var c = columns[j];
                        if (c.field == name_1) {
                            column = c;
                            break;
                        }
                    }
                    if (column) {
                        var type = new String();
                        if (f instanceof Type.String && column.type == "string") {
                            type = "string";
                        }
                        else if (f instanceof Type.Number && column.type == "number") {
                            type = "number";
                        }
                        else if (f instanceof Type.Boolean && column.type == "boolean") {
                            type = "boolean";
                        }
                        else if (f instanceof Type.Date && column.type == "date") {
                            type = "date";
                        }
                        else {
                            throw new Error("Tyep mismatch found for Column: " + name_1 + " in Table:" + this.mapping.name);
                        }
                        this.mapping.fields.set(key, new Mapping.FieldMapping({
                            name: name_1,
                            type: type
                        }));
                        if (column.primaryKey) {
                            this.mapping.primaryKey = key;
                            this.mapping.primaryKeyField = this.mapping.fields.get(key);
                        }
                    }
                    else {
                        throw new Error("Column: " + name_1 + " not found in Table: " + this.mapping.name);
                    }
                }
            }
        }
    };
    DBSet.prototype.getEntity = function (alias) {
        var a = new this.entityType();
        var name = null;
        var keys = Reflect.ownKeys(a);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var q = a[key];
            if (q instanceof Type.Field) {
                var field = this.mapping.fields.get(key);
                name = field.name;
                q._name = name;
                q._alias = alias;
            }
        }
        return a;
    };
    DBSet.prototype.isUpdated = function (obj, key) {
        return obj[key]._updated ? true : false;
    };
    DBSet.prototype.setValue = function (obj, key, value) {
        if (value != null) {
            obj[key].set(value);
        }
    };
    DBSet.prototype.getValue = function (obj, key) {
        return obj[key].get();
    };
    DBSet.prototype.executeStatement = function (stat) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.context.execute(stat)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DBSet.prototype.insert = function (entity) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var stat, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stat = new Query.SqlStatement();
                        stat.command = "insert";
                        stat.collection.value = this.mapping.name;
                        return [4 /*yield*/, Reflect.ownKeys(entity).forEach(function (key) {
                                var q = entity[key];
                                if (q instanceof Type.Field && _this.isUpdated(entity, key)) {
                                    var f = _this.mapping.fields.get(key);
                                    var c = new Query.SqlCollection();
                                    c.value = f.name;
                                    stat.columns.push(c);
                                    var v = new Query.SqlExpression("?");
                                    v.args.push(_this.getValue(entity, key));
                                    stat.values.push(v);
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.context.execute(stat)];
                    case 2:
                        result = _a.sent();
                        return [4 /*yield*/, this.get(result.id)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DBSet.prototype.update = function (entity) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var stat, w1, w2, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stat = new Query.SqlStatement();
                        stat.command = "update";
                        stat.collection.value = this.mapping.name;
                        return [4 /*yield*/, Reflect.ownKeys(entity).forEach(function (key) {
                                var f = _this.mapping.fields.get(key);
                                var q = entity[key];
                                if (q instanceof Type.Field && _this.isUpdated(entity, key) && f != _this.mapping.primaryKeyField) {
                                    var c1 = new Query.SqlExpression(f.name);
                                    var c2 = new Query.SqlExpression("?");
                                    c2.args.push(_this.getValue(entity, key));
                                    var c = new Query.SqlExpression(null, Query.Operator.Equal, c1, c2);
                                    stat.columns.push(c);
                                }
                            })];
                    case 1:
                        _a.sent();
                        w1 = new Query.SqlExpression(this.mapping.primaryKeyField.name);
                        w2 = new Query.SqlExpression("?");
                        w2.args.push(this.getValue(entity, this.mapping.primaryKey));
                        stat.where = new Query.SqlExpression(null, Query.Operator.Equal, w1, w2);
                        if (!(stat.columns.length > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.context.execute(stat)];
                    case 2:
                        result = _a.sent();
                        if (!result.error) return [3 /*break*/, 3];
                        throw result.error;
                    case 3: return [4 /*yield*/, this.get(this.getValue(entity, this.mapping.primaryKey))];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5: return [3 /*break*/, 7];
                    case 6: return [2 /*return*/, null];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    DBSet.prototype.insertOrUpdate = function (entity) {
        if (this.getValue(entity, this.mapping.primaryKey)) {
            return this.update(entity);
        }
        else {
            return this.insert(entity);
        }
    };
    DBSet.prototype["delete"] = function (entity) {
        return __awaiter(this, void 0, void 0, function () {
            var stat, w1, w2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stat = new Query.SqlStatement();
                        stat.command = "delete";
                        stat.collection.value = this.mapping.name;
                        w1 = new Query.SqlExpression(this.mapping.primaryKeyField.name);
                        w2 = new Query.SqlExpression("?");
                        w2.args.push(this.getValue(entity, this.mapping.primaryKey));
                        stat.where = new Query.SqlExpression(null, Query.Operator.Equal, w1, w2);
                        return [4 /*yield*/, this.context.execute(stat)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DBSet.prototype.get = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var fieldName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.mapping.primaryKeyField)
                            throw new Error("No Primary Field Found in Table: " + this.mapping.name);
                        if (!id)
                            throw new Error("Id parameter cannot be null");
                        fieldName = this.mapping.primaryKey;
                        return [4 /*yield*/, this.where(function (a, id) {
                                return a[fieldName].eq(id);
                            }, id).unique()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DBSet.prototype.where = function (param) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var stat = new Query.SqlStatement();
        stat.command = "select";
        var alias = this.mapping.name.charAt(0);
        stat.collection.value = this.mapping.name;
        stat.collection.alias = alias;
        var res = null;
        if (param instanceof Function) {
            var a = this.getEntity(stat.collection.alias);
            res = param(a, args);
        }
        else {
            res = param;
        }
        if (res instanceof Query.SqlExpression && res.exps.length > 0) {
            stat.where = res;
        }
        var s = new SimpleQueryable(stat, this);
        return s;
    };
    DBSet.prototype.groupBy = function (func) {
        var q = this.where();
        return q.groupBy(func);
    };
    DBSet.prototype.orderBy = function (func) {
        var q = this.where();
        return q.orderBy(func);
    };
    DBSet.prototype.limit = function (size, index) {
        var q = this.where();
        return q.limit(size, index);
    };
    DBSet.prototype.list = function () {
        var q = this.where();
        return q.list();
    };
    DBSet.prototype.unique = function () {
        var q = this.where();
        return q.unique();
    };
    return DBSet;
}());
exports.DBSet = DBSet;
/**
 * SimpleQueryable
 */
var SimpleQueryable = (function () {
    function SimpleQueryable(stat, dbSet) {
        this.dbSet = null;
        this.stat = null;
        this.stat = stat;
        this.dbSet = dbSet;
    }
    // Selection Functions
    SimpleQueryable.prototype.list = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var alias, result, data, _loop_1, this_1, j;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        alias = this.stat.collection.alias;
                        this.dbSet.mapping.fields.forEach(function (field, fieldName) {
                            var c = new Query.SqlCollection();
                            c.colAlias = alias;
                            c.value = field.name;
                            c.alias = fieldName;
                            _this.stat.columns.push(c);
                        });
                        return [4 /*yield*/, this.dbSet.executeStatement(this.stat)];
                    case 1:
                        result = _a.sent();
                        data = new Array();
                        _loop_1 = function (j) {
                            var row, a;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        row = result.rows[j];
                                        a = this_1.dbSet.getEntity();
                                        return [4 /*yield*/, this_1.dbSet.mapping.fields.forEach(function (field, fieldName) {
                                                _this.dbSet.setValue(a, fieldName, row[fieldName]);
                                            })];
                                    case 1:
                                        _a.sent();
                                        data.push(a);
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        j = 0;
                        _a.label = 2;
                    case 2:
                        if (!(j < result.rows.length)) return [3 /*break*/, 5];
                        return [5 /*yield**/, _loop_1(j)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        j++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, data];
                }
            });
        });
    };
    // Selection Functions
    SimpleQueryable.prototype.select = function (func) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var cols, a, temp, i, alias_1, result, data, _loop_2, this_2, j;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cols = new Array();
                        if (!func) return [3 /*break*/, 1];
                        a = this.dbSet.getEntity(this.stat.collection.alias);
                        temp = func(a);
                        if (temp instanceof Array) {
                            for (i = 0; i < temp.length; i++) {
                                cols.push(temp[i]._createExpr());
                            }
                        }
                        else {
                            cols.push(temp._createExpr());
                        }
                        return [3 /*break*/, 3];
                    case 1:
                        alias_1 = this.stat.collection.alias;
                        return [4 /*yield*/, this.dbSet.mapping.fields.forEach(function (field, fieldName) {
                                var c = new Query.SqlCollection();
                                c.colAlias = alias_1;
                                c.value = field.name;
                                c.alias = fieldName;
                                _this.stat.columns.push(c);
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.dbSet.executeStatement(this.stat)];
                    case 4:
                        result = _a.sent();
                        if (!(result.rows.length == 0)) return [3 /*break*/, 5];
                        throw new Error("No Result Found");
                    case 5:
                        data = new Array();
                        _loop_2 = function (j) {
                            var row, a;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        row = result.rows[j];
                                        a = this_2.dbSet.getEntity();
                                        return [4 /*yield*/, this_2.dbSet.mapping.fields.forEach(function (field, fieldName) {
                                                _this.dbSet.setValue(a, fieldName, row[fieldName]);
                                            })];
                                    case 1:
                                        _a.sent();
                                        data.push(a);
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_2 = this;
                        j = 0;
                        _a.label = 6;
                    case 6:
                        if (!(j < result.rows.length)) return [3 /*break*/, 9];
                        return [5 /*yield**/, _loop_2(j)];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        j++;
                        return [3 /*break*/, 6];
                    case 9: return [2 /*return*/, data];
                }
            });
        });
    };
    SimpleQueryable.prototype.unique = function () {
        return __awaiter(this, void 0, void 0, function () {
            var l;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.list()];
                    case 1:
                        l = _a.sent();
                        if (l.length > 1) {
                            throw new Error("More than one row found in unique call");
                        }
                        else {
                            return [2 /*return*/, l[0]];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // Conditional Functions
    SimpleQueryable.prototype.where = function (param) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var res = null;
        if (param instanceof Function) {
            var a = this.dbSet.getEntity(this.stat.collection.alias);
            res = param(a, args);
        }
        else {
            res = param;
        }
        if (res instanceof Query.SqlExpression && res.exps.length > 0) {
            this.stat.where = this.stat.where.add(res);
        }
        var s = new SimpleQueryable(this.stat, this.dbSet);
        return s;
    };
    SimpleQueryable.prototype.groupBy = function (param) {
        var a = this.dbSet.getEntity(this.stat.collection.alias);
        var res = null;
        if (param instanceof Function) {
            res = param(a);
        }
        else if (param instanceof Array) {
            res = param;
        }
        if (res instanceof Array) {
            for (var i = 0; i < res.length; i++) {
                if (res[i] instanceof Query.SqlExpression && res[i].exps.length > 0) {
                    this.stat.groupBy.push(res[i]._createExpr());
                }
            }
        }
        else {
            if (res instanceof Query.SqlExpression && res.exps.length > 0) {
                this.stat.groupBy.push(res._createExpr());
            }
        }
        var s = new SimpleQueryable(this.stat, this.dbSet);
        return s;
    };
    SimpleQueryable.prototype.orderBy = function (param) {
        var a = this.dbSet.getEntity(this.stat.collection.alias);
        var res = null;
        if (param instanceof Function) {
            res = param(a);
        }
        else if (param instanceof Array) {
            res = param;
        }
        if (res instanceof Array) {
            for (var i = 0; i < res.length; i++) {
                if (res[i] instanceof Query.SqlExpression && res[i].exps.length > 0) {
                    this.stat.orderBy.push(res[i]._createExpr());
                }
            }
        }
        else {
            if (res instanceof Query.SqlExpression && res.exps.length > 0) {
                this.stat.orderBy.push(res._createExpr());
            }
        }
        var s = new SimpleQueryable(this.stat, this.dbSet);
        return s;
    };
    SimpleQueryable.prototype.limit = function (size, index) {
        this.stat.limit = new Query.SqlExpression(null, Query.Operator.Limit);
        if (index) {
            this.stat.limit.exps.push(new Query.SqlExpression(index.toString()));
        }
        this.stat.limit.exps.push(new Query.SqlExpression(size.toString()));
        var s = new SimpleQueryable(this.stat, this.dbSet);
        return s;
    };
    return SimpleQueryable;
}());
