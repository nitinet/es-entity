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
var pg = require("pg");
var Handler = require("./../Handler");
var Query = require("./../Query");
var PostGreHandler = (function (_super) {
    __extends(PostGreHandler, _super);
    function PostGreHandler(config) {
        var _this = _super.call(this) || this;
        _this.handlerName = 'postgres';
        _this.connectionPool = null;
        _this.config = config;
        _this.connectionPool = pg.Pool({
            user: _this.config.username,
            password: _this.config.password,
            database: _this.config.database,
            host: _this.config.host,
            max: _this.config.connectionLimit
        });
        return _this;
    }
    PostGreHandler.prototype.getConnection = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var conn = pg.Client({
                host: _this.config.hostname,
                user: _this.config.username,
                password: _this.config.password,
                database: _this.config.database
            });
            conn.connect(function (err) {
                return err ?
                    reject(err) :
                    resolve(new Connection(_this, conn));
            });
        });
    };
    PostGreHandler.prototype.getTableInfo = function (tableName) {
        var aDescQuery = "SELECT  " +
            "    f.attnum AS number,  " +
            "    f.attname AS Field,  " +
            "    f.attnum,  " +
            "    f.attnotnull AS notnull,  " +
            "    pg_catalog.format_type(f.atttypid,f.atttypmod) AS data_type,  " +
            "    CASE WHEN p.contype   = 'p' THEN true ELSE false END AS primarykey,  " +
            "    CASE WHEN p.contype   = 'u' THEN true ELSE false END AS uniquekey," +
            "    CASE WHEN p.contype   = 'f' THEN g.relname       END AS foreignkey," +
            "    CASE WHEN p.contype   = 'f' THEN p.confkey       END AS foreignkey_fieldnum," +
            "    CASE WHEN p.contype   = 'f' THEN g.relname       END AS foreignkey," +
            "    CASE WHEN p.contype   = 'f' THEN p.conkey        END AS foreignkey_connnum," +
            "    CASE WHEN f.atthasdef = 't' THEN d.adsrc         END AS default " +
            "FROM pg_attribute f " +
            "    JOIN pg_class c ON c.oid = f.attrelid  " +
            "    JOIN pg_type t ON t.oid = f.atttypid  " +
            "    LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = f.attnum " +
            "    LEFT JOIN pg_namespace n ON n.oid = c.relnamespace  " +
            "    LEFT JOIN pg_constraint p ON p.conrelid = c.oid AND f.attnum = ANY (p.conkey)  " +
            "    LEFT JOIN pg_class AS g ON p.confrelid = g.oid  " +
            "WHERE c.relkind = 'r'::char  " +
            "    AND c.relname = '" + tableName + "' " +
            "    AND f.attnum > 0 ORDER BY number";
        var nRetTableInfo = this.run(aDescQuery);
        var result = util.deAsync(nRetTableInfo);
        result.rows.forEach(function (row) {
            var aObj = new Handler.ColumnInfo();
            var columnType = row["data_type"].toLowerCase();
            if (columnType.includes("int") ||
                columnType.includes("float") ||
                columnType.includes("double") ||
                columnType.includes("decimal") ||
                columnType.includes("real") ||
                columnType.includes("numeric")) {
                aObj.type = "number";
            }
            else if (columnType.includes("varchar") ||
                columnType.includes("text") ||
                columnType.includes("character varying")) {
                aObj.type = "string";
            }
            else if (columnType.includes("timestamp")) {
                aObj.type = "date";
            }
            aObj.field = row["Field"];
            aObj.nullable = !row["notnull"];
            aObj.primaryKey = row["primarykey"];
            aObj["default"] = row["default"];
            //aObj.extra    = ????
            result.push(aObj);
        });
        return result;
    };
    PostGreHandler.prototype.run = function (query, args, connection) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var q, p;
            return __generator(this, function (_a) {
                q = null;
                if (typeof query === "string")
                    q = query;
                else if (query instanceof Query.SqlStatement) {
                    q = query.eval(this);
                    args = query.args;
                }
                p = new Promise(function (resolve, reject) {
                    var r = new Handler.ResultSet();
                    if (connection
                        && connection instanceof Connection
                        && connection.Handler.handlerName == _this.handlerName
                        && connection.conn) {
                    }
                    else {
                        _this.connectionPool.query(val, args, function (err, result) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                if (result.insertId)
                                    r.id = result.insertId;
                                if (result.changedRows)
                                    r.rowCount = result.changedRows;
                                if (Array.isArray(result))
                                    r.rows = result, r.rowCount = result.length;
                            }
                            resolve(r);
                        });
                    }
                });
                return [2 /*return*/, p];
            });
        });
    };
    return PostGreHandler;
}(Handler["default"]));
exports["default"] = PostGreHandler;
