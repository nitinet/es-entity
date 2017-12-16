"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const Case = require("case");
const Type = require("./Type");
const Mapping = require("./Mapping");
const Query = require("./Query");
class DBSet {
    constructor(entityType, entityName, entityPath) {
        this.entityName = null;
        this.entityPath = null;
        this.mapping = new Mapping.EntityMapping();
        this.entityType = entityType;
        this.entityName = entityName ? entityName : this.entityType.name;
        this.entityPath = entityPath;
    }
    bind(context) {
        this.context = context;
        let filePath = null;
        if (this.entityPath) {
            filePath = this.entityPath;
        }
        else if (this.context.entityPath) {
            filePath = path.join(this.context.entityPath, this.entityName + ".json");
        }
        if (this && fs.statSync(filePath).isFile()) {
            let data = fs.readFileSync(filePath, "utf-8");
            this.mapping = new Mapping.EntityMapping(JSON.parse(data));
        }
        else {
            this.mapping = new Mapping.EntityMapping();
            this.mapping.entityName = this.entityName;
            this.mapping.name = Case.snake(this.entityName);
            let columns = this.context.handler.getTableInfo(this.mapping.name);
            let a = new this.entityType();
            let keys = Reflect.ownKeys(a);
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let f = a[key];
                if (f instanceof Type.Field) {
                    let name = Case.snake(key.toString());
                    let column = null;
                    for (let j = 0; j < columns.length; j++) {
                        let c = columns[j];
                        if (c.field == name) {
                            column = c;
                            break;
                        }
                    }
                    if (column) {
                        let type = new String();
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
                        else if (f instanceof Type.Object && column.type == "string") {
                            type = "object";
                        }
                        else {
                            throw new Error("Type mismatch found for Column: " + name + " in Table:" + this.mapping.name);
                        }
                        this.mapping.fields.set(key, new Mapping.FieldMapping({
                            name: name,
                            type: type
                        }));
                        if (column.primaryKey) {
                            this.mapping.primaryKey = key;
                            this.mapping.primaryKeyField = this.mapping.fields.get(key);
                        }
                    }
                    else {
                        throw new Error("Column: " + name + " not found in Table: " + this.mapping.name);
                    }
                }
            }
        }
    }
    getEntity(alias) {
        let a = new this.entityType();
        let name = null;
        let keys = Reflect.ownKeys(a);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let q = a[key];
            if (q instanceof Type.Field) {
                let field = this.mapping.fields.get(key);
                name = field.name;
                q._name = name;
                q._alias = alias;
            }
        }
        return a;
    }
    isUpdated(obj, key) {
        return obj[key]._updated ? true : false;
    }
    setValue(obj, key, value) {
        if (value != null) {
            obj[key].set(value);
            obj[key]._updated = false;
        }
    }
    getValue(obj, key) {
        return obj[key]._value;
    }
    async executeStatement(stat) {
        return await this.context.execute(stat);
    }
    async insert(entity) {
        let stat = new Query.SqlStatement();
        stat.command = "insert";
        stat.collection.value = this.mapping.name;
        await Reflect.ownKeys(entity).forEach((key) => {
            let q = entity[key];
            if (q instanceof Type.Field && this.isUpdated(entity, key)) {
                let f = this.mapping.fields.get(key);
                let c = new Query.SqlCollection();
                c.value = f.name;
                stat.columns.push(c);
                let v = new Query.SqlExpression("?");
                v.args.push(this.getValue(entity, key));
                stat.values.push(v);
            }
        });
        let result = await this.context.execute(stat);
        if (!result.id) {
            result.id = this.getValue(entity, this.mapping.primaryKey);
        }
        return await this.get(result.id);
    }
    async update(entity) {
        let stat = new Query.SqlStatement();
        stat.command = "update";
        stat.collection.value = this.mapping.name;
        await Reflect.ownKeys(entity).forEach((key) => {
            let f = this.mapping.fields.get(key);
            let q = entity[key];
            if (q instanceof Type.Field && this.isUpdated(entity, key) && f != this.mapping.primaryKeyField) {
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
            let result = await this.context.execute(stat);
            if (result.error)
                throw result.error;
            else
                return await this.get(this.getValue(entity, this.mapping.primaryKey));
        }
        else {
            return null;
        }
    }
    insertOrUpdate(entity) {
        if (this.getValue(entity, this.mapping.primaryKey)) {
            return this.update(entity);
        }
        else {
            return this.insert(entity);
        }
    }
    async delete(entity) {
        let stat = new Query.SqlStatement();
        stat.command = "delete";
        stat.collection.value = this.mapping.name;
        let w1 = new Query.SqlExpression(this.mapping.primaryKeyField.name);
        let w2 = new Query.SqlExpression("?");
        w2.args.push(this.getValue(entity, this.mapping.primaryKey));
        stat.where = new Query.SqlExpression(null, Query.Operator.Equal, w1, w2);
        await this.context.execute(stat);
    }
    async get(id) {
        if (!this.mapping.primaryKeyField)
            throw new Error("No Primary Field Found in Table: " + this.mapping.name);
        if (!id)
            throw new Error("Id parameter cannot be null");
        let fieldName = this.mapping.primaryKey;
        return await this.where((a, id) => {
            return a[fieldName].eq(id);
        }, id).unique();
    }
    where(param, ...args) {
        let stat = new Query.SqlStatement();
        stat.command = "select";
        let alias = this.mapping.name.charAt(0);
        stat.collection.value = this.mapping.name;
        stat.collection.alias = alias;
        let res = null;
        if (param instanceof Function) {
            let a = this.getEntity(stat.collection.alias);
            res = param(a, args);
        }
        else {
            res = param;
        }
        if (res instanceof Query.SqlExpression && res.exps.length > 0) {
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
    limit(size, index) {
        let q = this.where();
        return q.limit(size, index);
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
    getEntity(alias) {
        return this.dbSet.getEntity(alias);
    }
    insert(entity) {
        return this.dbSet.insert(entity);
    }
    update(entity) {
        return this.dbSet.update(entity);
    }
    insertOrUpdate(entity) {
        return this.dbSet.insertOrUpdate(entity);
    }
    delete(entity) {
        return this.dbSet.delete(entity);
    }
    async list() {
        let alias = this.stat.collection.alias;
        this.dbSet.mapping.fields.forEach((field, fieldName) => {
            let c = new Query.SqlCollection();
            c.colAlias = alias;
            c.value = field.name;
            c.alias = fieldName;
            this.stat.columns.push(c);
        });
        let result = await this.dbSet.executeStatement(this.stat);
        let data = new Array();
        for (let j = 0; j < result.rows.length; j++) {
            let row = result.rows[j];
            let a = this.dbSet.getEntity();
            await this.dbSet.mapping.fields.forEach((field, fieldName) => {
                this.dbSet.setValue(a, fieldName, row[fieldName]);
            });
            data.push(a);
        }
        return data;
    }
    async select(func) {
        let cols = new Array();
        if (func) {
            let a = this.dbSet.getEntity(this.stat.collection.alias);
            let temp = func(a);
            if (temp instanceof Array) {
                for (let i = 0; i < temp.length; i++) {
                    cols.push(temp[i]._createExpr());
                }
            }
            else {
                cols.push(temp._createExpr());
            }
        }
        else {
            let alias = this.stat.collection.alias;
            await this.dbSet.mapping.fields.forEach((field, fieldName) => {
                let c = new Query.SqlCollection();
                c.colAlias = alias;
                c.value = field.name;
                c.alias = fieldName;
                this.stat.columns.push(c);
            });
        }
        let result = await this.dbSet.executeStatement(this.stat);
        if (result.rows.length == 0)
            throw new Error("No Result Found");
        else {
            let data = new Array();
            for (let j = 0; j < result.rows.length; j++) {
                let row = result.rows[j];
                let a = this.dbSet.getEntity();
                await this.dbSet.mapping.fields.forEach((field, fieldName) => {
                    this.dbSet.setValue(a, fieldName, row[fieldName]);
                });
                data.push(a);
            }
            return data;
        }
    }
    async unique() {
        let l = await this.list();
        if (l.length > 1) {
            throw new Error("More than one row found in unique call");
        }
        else {
            return l[0];
        }
    }
    where(param, ...args) {
        let res = null;
        if (param instanceof Function) {
            let a = this.dbSet.getEntity(this.stat.collection.alias);
            res = param(a, args);
        }
        else {
            res = param;
        }
        if (res instanceof Query.SqlExpression && res.exps.length > 0) {
            this.stat.where = this.stat.where.add(res);
        }
        let s = new SimpleQueryable(this.stat, this.dbSet);
        return s;
    }
    groupBy(param) {
        let a = this.dbSet.getEntity(this.stat.collection.alias);
        let res = null;
        if (param instanceof Function) {
            res = param(a);
        }
        else if (param instanceof Array) {
            res = param;
        }
        if (res instanceof Array) {
            for (let i = 0; i < res.length; i++) {
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
        let s = new SimpleQueryable(this.stat, this.dbSet);
        return s;
    }
    orderBy(param) {
        let a = this.dbSet.getEntity(this.stat.collection.alias);
        let res = null;
        if (param instanceof Function) {
            res = param(a);
        }
        else if (param instanceof Array) {
            res = param;
        }
        if (res instanceof Array) {
            for (let i = 0; i < res.length; i++) {
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
        let s = new SimpleQueryable(this.stat, this.dbSet);
        return s;
    }
    limit(size, index) {
        this.stat.limit = new Query.SqlExpression(null, Query.Operator.Limit);
        if (index) {
            this.stat.limit.exps.push(new Query.SqlExpression(index.toString()));
        }
        this.stat.limit.exps.push(new Query.SqlExpression(size.toString()));
        let s = new SimpleQueryable(this.stat, this.dbSet);
        return s;
    }
}
