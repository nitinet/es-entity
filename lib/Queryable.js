"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const fs = require("fs");
const path = require("path");
const Case = require("case");
const Entity_1 = require("./Entity");
const Mapping = require("./Mapping");
const Query = require("./Query");
class DBSet {
    constructor(entityType) {
        this.mapping = new Mapping.EntityMapping();
        this.entityType = entityType;
    }
    bind(context) {
        return __awaiter(this, void 0, Promise, function* () {
            this.context = context;
            let entityName = this.entityType.name;
            let filePath = null;
            if (this.context.entityPath) {
                filePath = path.join(this.context.entityPath, entityName + ".json");
            }
            if (filePath && fs.statSync(filePath).isFile()) {
                let data = fs.readFileSync(filePath, "utf-8");
                this.mapping = new Mapping.EntityMapping(JSON.parse(data));
            }
            else {
                this.mapping = new Mapping.EntityMapping();
                this.mapping.entityName = entityName;
                this.mapping.name = Case.snake(entityName);
                let columns = yield this.context.handler.getTableInfo(this.mapping.name);
                let a = new this.entityType();
                let keys = Reflect.ownKeys(a);
                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i];
                    let f = a[key];
                    if (f instanceof Entity_1.Field) {
                        let name = Case.snake(key);
                        let column = null;
                        for (var j = 0; j < columns.length; j++) {
                            var c = columns[j];
                            if (c.field == name) {
                                column = c;
                            }
                        }
                        if (column) {
                            let type = new String();
                            if (f instanceof Entity_1.StringField && column.type == "string") {
                                type = "string";
                            }
                            else if (f instanceof Entity_1.NumberField && column.type == "number") {
                                type = "number";
                            }
                            else if (f instanceof Entity_1.BooleanField && column.type == "boolean") {
                                type = "boolean";
                            }
                            else if (f instanceof Entity_1.DateField && column.type == "date") {
                                type = "date";
                            }
                            else {
                                throw "Tyep mismatch found for column " + name;
                            }
                            this.mapping.fields.set(key, new Mapping.FieldMapping({ name: name, type: type }));
                            if (column.primaryKey) {
                                this.mapping.primaryKey = key;
                                this.mapping.primaryKeyField = this.mapping.fields.get(key);
                            }
                        }
                        else {
                            throw "Column " + name + " not found";
                        }
                    }
                }
            }
        });
    }
    getEntity(alias) {
        let a = new this.entityType();
        let name = null;
        Reflect.ownKeys(a).forEach((key) => {
            let q = a[key];
            if (q instanceof Entity_1.Field) {
                let field = this.mapping.fields.get(key);
                name = field.name;
                q._name = name;
                q._alias = alias;
            }
        });
        return a;
    }
    isUpdated(obj, key) {
        return obj[key]._updated ? true : false;
    }
    setValue(obj, key, value) {
        obj[key].set(value);
    }
    getValue(obj, key) {
        return obj[key].get();
    }
    executeStatement(stat) {
        return this.context.execute(stat);
    }
    insert(entity) {
        return __awaiter(this, void 0, Promise, function* () {
            let stat = new Query.SqlStatement();
            stat.command = "insert";
            stat.collection.value = this.mapping.name;
            yield Reflect.ownKeys(entity).forEach((key) => {
                let q = entity[key];
                if (q instanceof Entity_1.Field) {
                    let f = this.mapping.fields.get(key);
                    let c = new Query.SqlCollection();
                    c.value = f.name;
                    stat.columns.push(c);
                    let v = new Query.SqlExpression("?");
                    v.args.push(this.getValue(entity, key));
                    stat.values.push(v);
                }
            });
            let result = yield this.context.execute(stat);
            return yield this.get(result.id);
        });
    }
    update(entity) {
        return __awaiter(this, void 0, Promise, function* () {
            let stat = new Query.SqlStatement();
            stat.command = "update";
            stat.collection.value = this.mapping.name;
            yield Reflect.ownKeys(entity).forEach((key) => {
                let f = this.mapping.fields.get(key);
                if (this.isUpdated(entity, key) && f != this.mapping.primaryKeyField) {
                    let c1 = new Query.SqlExpression(f.name);
                    let c2 = new Query.SqlExpression("?");
                    c2.args.push(this.getValue(entity, key));
                    let c = new Query.SqlExpression(null, Query.Operator.Equal, c1, c2);
                    stat.columns.push(c);
                }
            });
            let w1 = new Query.SqlExpression(this.mapping.primaryKeyField.name);
            let w2 = new Query.SqlExpression("?");
            w2.args.push(this.getValue(entity, this.mapping.primaryKey));
            stat.where = new Query.SqlExpression(null, Query.Operator.Equal, w1, w2);
            if (stat.columns.length > 0) {
                let result = yield this.context.execute(stat);
                if (result.error)
                    throw result.error;
                else
                    return yield this.get(this.getValue(entity, this.mapping.primaryKey));
            }
            else {
                return null;
            }
        });
    }
    insertOrUpdate(entity) {
        if (this.getValue(entity, this.mapping.primaryKey)) {
            return this.update(entity);
        }
        else {
            return this.insert(entity);
        }
    }
    delete(entity) {
        return __awaiter(this, void 0, Promise, function* () {
            let stat = new Query.SqlStatement();
            stat.command = "delete";
            stat.collection.value = this.mapping.name;
            let w1 = new Query.SqlExpression(this.mapping.primaryKeyField.name);
            let w2 = new Query.SqlExpression("?");
            w2.args.push(this.getValue(entity, this.mapping.primaryKey));
            stat.where = new Query.SqlExpression(null, Query.Operator.Equal, w1, w2);
            yield this.context.execute(stat);
        });
    }
    get(id) {
        return __awaiter(this, void 0, Promise, function* () {
            if (!this.mapping.primaryKeyField)
                throw "No Primary Field Found";
            if (!id)
                throw "Id parameter cannot be null";
            let fieldName = this.mapping.primaryKey;
            return yield this.where((a, id) => {
                return a[fieldName].eq(id);
            }, id).unique();
        });
    }
    where(param, ...args) {
        let stat = new Query.SqlStatement();
        stat.command = "select";
        let alias = this.mapping.name.charAt(0);
        stat.collection.value = this.mapping.name;
        stat.collection.alias = alias;
        let a = this.getEntity(stat.collection.alias);
        let res = null;
        if (param) {
            if (param instanceof Function) {
                res = param(a, args);
            }
            else if (param instanceof Query.SqlExpression) {
                res = param;
            }
        }
        if (res instanceof Query.SqlExpression) {
            stat.where = res;
        }
        let s = new SimpleQueryable(stat, this);
        return s;
    }
    groupBy(func) {
        let q = this.where();
        return q.groupBy(func);
    }
    orderBy(func) {
        let q = this.where();
        return q.orderBy(func);
    }
    list() {
        let q = this.where();
        return q.list();
    }
    unique() {
        let q = this.where();
        return q.unique();
    }
}
exports.DBSet = DBSet;
class SimpleQueryable {
    constructor(stat, dbSet) {
        this.dbSet = null;
        this.stat = null;
        this.stat = stat;
        this.dbSet = dbSet;
    }
    list() {
        return __awaiter(this, void 0, Promise, function* () {
            let alias = this.stat.collection.alias;
            this.dbSet.mapping.fields.forEach((field, fieldName) => {
                let c = new Query.SqlCollection();
                c.colAlias = alias;
                c.value = field.name;
                c.alias = fieldName;
                this.stat.columns.push(c);
            });
            let result = yield this.dbSet.executeStatement(this.stat);
            let data = new Array();
            for (let j = 0; j < result.rows.length; j++) {
                let row = result.rows[j];
                let a = this.dbSet.getEntity();
                yield this.dbSet.mapping.fields.forEach((field, fieldName) => {
                    this.dbSet.setValue(a, fieldName, row[fieldName]);
                });
                data.push(a);
            }
            return data;
        });
    }
    select(func) {
        return __awaiter(this, void 0, Promise, function* () {
            let cols = new Array();
            if (func) {
                let a = this.dbSet.getEntity(this.stat.collection.alias);
                let temp = func(a);
                for (var i = 0; i < temp.length; i++) {
                    var e = temp[i];
                    cols.push(e._createExpr());
                }
            }
            else {
                let alias = this.stat.collection.alias;
                yield this.dbSet.mapping.fields.forEach((field, fieldName) => {
                    let c = new Query.SqlCollection();
                    c.colAlias = alias;
                    c.value = field.name;
                    c.alias = fieldName;
                    this.stat.columns.push(c);
                });
            }
            let result = yield this.dbSet.executeStatement(this.stat);
            if (result.rows.length == 0)
                throw "No Result Found";
            else {
                let data = new Array();
                for (let j = 0; j < result.rows.length; j++) {
                    let row = result.rows[j];
                    let a = this.dbSet.getEntity();
                    yield this.dbSet.mapping.fields.forEach((field, fieldName) => {
                        this.dbSet.setValue(a, fieldName, row[fieldName]);
                    });
                    data.push(a);
                }
                return data;
            }
        });
    }
    unique() {
        return __awaiter(this, void 0, Promise, function* () {
            let l = yield this.list();
            if (l.length > 1) {
                throw "More than one row found";
            }
            else {
                return l[0];
            }
        });
    }
    where(param, ...args) {
        let a = this.dbSet.getEntity(this.stat.collection.alias);
        let res = null;
        if (param) {
            if (param instanceof Function) {
                res = param(a, args);
            }
            else if (param instanceof Query.SqlExpression) {
                res = param;
            }
        }
        if (res instanceof Query.SqlExpression) {
            this.stat.where.add(res);
        }
        let s = new SimpleQueryable(this.stat, this.dbSet);
        return s;
    }
    groupBy(param) {
        let a = this.dbSet.getEntity(this.stat.collection.alias);
        let res = null;
        if (param) {
            if (param instanceof Function) {
                res = param(a);
            }
            else if (param instanceof Array) {
                res = param;
            }
        }
        if (res instanceof Array) {
            for (let i = 0; i < res.length; i++) {
                if (res[i] instanceof Query.SqlExpression) {
                    this.stat.groupBy.push(res[i]._createExpr());
                }
            }
        }
        let s = new SimpleQueryable(this.stat, this.dbSet);
        return s;
    }
    orderBy(param) {
        let a = this.dbSet.getEntity(this.stat.collection.alias);
        let res = null;
        if (param) {
            if (param instanceof Function) {
                res = param(a);
            }
            else if (param instanceof Array) {
                res = param;
            }
        }
        if (res instanceof Array) {
            for (let i = 0; i < res.length; i++) {
                if (res[i] instanceof Query.SqlExpression) {
                    this.stat.orderBy.push(res[i]._createExpr());
                }
            }
        }
        let s = new SimpleQueryable(this.stat, this.dbSet);
        return s;
    }
}
