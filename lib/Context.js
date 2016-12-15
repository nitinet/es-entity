"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const Queryable_1 = require("./Queryable");
const MysqlHandler_1 = require("./handlers/MysqlHandler");
const OracleDbHandler_1 = require("./handlers/OracleDbHandler");
const MsSqlServerHandler_1 = require("./handlers/MsSqlServerHandler");
const PostGreHandler_1 = require("./handlers/PostGreHandler");
const SqlLiteHandler_1 = require("./handlers/SqlLiteHandler");
const Query = require("./Query");
function getHandler(config) {
    let handler = null;
    if (config.handler.toLowerCase() === "mysql") {
        handler = new MysqlHandler_1.default(config);
    }
    else if (config.handler.toLowerCase() === "oracle") {
        handler = new OracleDbHandler_1.default(config);
    }
    else if (config.handler.toLowerCase() === "postgre") {
        handler = new PostGreHandler_1.default(config);
    }
    else if (config.handler.toLowerCase() === "sqlserver") {
        handler = new MsSqlServerHandler_1.default(config);
    }
    else if (config.handler.toLowerCase() === "sqllite") {
        handler = new SqlLiteHandler_1.default(config);
    }
    else {
        throw "No Handler Found";
    }
    return handler;
}
exports.getHandler = getHandler;
class Context {
    constructor(config, entityPath) {
        this.connection = null;
        if (config) {
            this.setConfig(config);
        }
        if (entityPath) {
            this.setEntityPath(entityPath);
        }
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let keys = Reflect.ownKeys(this);
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let e = Reflect.get(this, key);
                if (e instanceof Queryable_1.DBSet) {
                    yield e.bind(this);
                }
            }
        });
    }
    setConfig(config) {
        this.handler = getHandler(config);
    }
    setEntityPath(entityPath) {
        this.entityPath = entityPath;
    }
    execute(query) {
        return this.handler.run(query, this.connection);
    }
    getCriteria() {
        return new Query.SqlExpression();
    }
    flush() { }
    initTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = this;
            if (!this.connection) {
                res = Object.assign({}, this);
                Object.setPrototypeOf(res, Object.getPrototypeOf(this));
                let keys = Reflect.ownKeys(res);
                keys.forEach((key) => {
                    let prop = Reflect.get(res, key);
                    if (prop instanceof Queryable_1.DBSet) {
                        prop.context = res;
                    }
                });
            }
            res.connection = yield res.handler.getConnection();
            yield res.connection.initTransaction();
            return res;
        });
    }
    commit() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connection.commit();
            yield this.connection.close();
        });
    }
    rollback() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connection.rollback();
            yield this.connection.close();
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Context;
