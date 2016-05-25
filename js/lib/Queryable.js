/// <reference path="./../../typings/globals/node/index.d.ts" />
"use strict";
const fs = require("fs");
const path = require("path");
const Entity_1 = require("./Entity");
const Mapping = require("./Mapping");
const Query = require("./Query");
class DBSet {
    constructor(entityType) {
        this.entityType = entityType;
    }
    bind(context) {
        this.context = context;
        let entityName = this.entityType.name;
        let filePath = path.join(context.mappingPath, entityName + ".json");
        let data = fs.readFileSync(filePath, "utf-8");
        this.mapping = new Mapping.EntityMapping(JSON.parse(data));
    }
    getEntity(alias) {
        let a = new this.entityType();
        this.mapping.fields.forEach(k => {
            let q = a[k.fieldName];
            if (q instanceof Entity_1.Field) {
                q._name = k.name;
                q._alias = alias;
            }
        });
        return a;
    }
    isUpdated(obj, key) {
        return obj[key]._updated ? true : false;
    }
    setValue(obj, key, value) {
        obj[key]._value = value;
    }
    getValue(obj, key) {
        return obj[key].val;
    }
    executeStatement(stat) {
        return this.context.execute(stat);
    }
    insert(entity) {
        let stat = new Query.SqlStatement();
        stat.command = "insert";
        stat.collection.value = this.mapping.name;
        for (let i = 0; i < this.mapping.fields.length; i++) {
            let f = this.mapping.fields[i];
            if (this.isUpdated(entity, f.fieldName)) {
                let c = new Query.SqlCollection();
                c.value = f.name;
                stat.columns.push(c);
                let v = new Query.SqlExpression("?");
                v.args.push(this.getValue(entity, f.fieldName));
                stat.values.push(v);
            }
        }
        return this.context.execute(stat).then((result) => {
            return this.get(result.id);
        });
    }
    update(entity) {
        let stat = new Query.SqlStatement();
        stat.command = "update";
        stat.collection.value = this.mapping.name;
        for (let i = 0; i < this.mapping.fields.length; i++) {
            let f = this.mapping.fields[i];
            if (this.isUpdated(entity, f.fieldName) && f != this.mapping.primaryKeyField) {
                let c1 = new Query.SqlExpression(f.name);
                let c2 = new Query.SqlExpression("?");
                c2.args.push(this.getValue(entity, f.fieldName));
                let c = new Query.SqlExpression(null, Query.Operator.Equal, c1, c2);
                stat.columns.push(c);
            }
        }
        let w1 = new Query.SqlExpression(this.mapping.primaryKeyField.name);
        let w2 = new Query.SqlExpression("?");
        w2.args.push(this.getValue(entity, this.mapping.primaryKeyField.fieldName));
        stat.where = new Query.SqlExpression(null, Query.Operator.Equal, w1, w2);
        if (stat.columns.length > 0) {
            return this.context.execute(stat).then((result) => {
                if (result.error)
                    throw result.error;
                else
                    return this.get(this.getValue(entity, this.mapping.primaryKeyField.fieldName));
            });
        }
        else {
            return null;
        }
    }
    insertOrUpdate(entity) {
        if (this.getValue(entity, this.mapping.primaryKeyField.fieldName)) {
            return this.update(entity);
        }
        else {
            return this.insert(entity);
        }
    }
    delete(entity) {
        let stat = new Query.SqlStatement();
        stat.command = "delete";
        stat.collection.value = this.mapping.name;
        let w1 = new Query.SqlExpression(this.mapping.primaryKeyField.name);
        let w2 = new Query.SqlExpression("?");
        w2.args.push(this.getValue(entity, this.mapping.primaryKeyField.fieldName));
        stat.where = new Query.SqlExpression(null, Query.Operator.Equal, w1, w2);
        return this.context.execute(stat).then(() => { });
    }
    get(id) {
        if (!this.mapping.primaryKeyField)
            throw "No Primary Field Found";
        if (!id)
            throw "Id parameter cannot be null";
        return this.where((a, id) => {
            return a[this.mapping.primaryKeyField.fieldName].eq(id);
        }, id).unique();
    }
    where(func, ...args) {
        let stat = new Query.SqlStatement();
        stat.command = "select";
        let alias = this.mapping.name.charAt(0);
        stat.collection.value = this.mapping.name;
        stat.collection.alias = alias;
        let a = this.getEntity(stat.collection.alias);
        let res = null;
        if (func) {
            res = func(a, args);
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
/**
 * SimpleQueryable
 */
class SimpleQueryable {
    constructor(stat, dbSet) {
        this.dbSet = null;
        this.stat = null;
        this.stat = stat;
        this.dbSet = dbSet;
    }
    // Selection Functions
    list() {
        let alias = this.stat.collection.alias;
        for (let i = 0; i < this.dbSet.mapping.fields.length; i++) {
            let e = this.dbSet.mapping.fields[i];
            let c = new Query.SqlCollection();
            c.colAlias = alias;
            c.value = e.name;
            c.alias = e.fieldName;
            this.stat.columns.push(c);
        }
        return this.dbSet.executeStatement(this.stat).then((result) => {
            let data = new Array();
            for (let j = 0; j < result.rows.length; j++) {
                let row = result.rows[j];
                let a = this.dbSet.getEntity();
                for (let i = 0; i < this.dbSet.mapping.fields.length; i++) {
                    let r = this.dbSet.mapping.fields[i];
                    this.dbSet.setValue(a, r.fieldName, row[r.fieldName]);
                }
                data.push(a);
            }
            return data;
        });
    }
    // Selection Functions
    select(func) {
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
            for (let i = 0; i < this.dbSet.mapping.fields.length; i++) {
                let e = this.dbSet.mapping.fields[i];
                let c = new Query.SqlCollection();
                c.colAlias = alias;
                c.value = e.name;
                c.alias = e.fieldName;
                this.stat.columns.push(c);
            }
        }
        return this.dbSet.executeStatement(this.stat).then((result) => {
            if (result.rows.length == 0)
                throw "No Result Found";
            else {
                let data = new Array();
                for (let j = 0; j < result.rows.length; j++) {
                    let row = result.rows[j];
                    let a = this.dbSet.getEntity();
                    for (let i = 0; i < this.dbSet.mapping.fields.length; i++) {
                        let r = this.dbSet.mapping.fields[i];
                        this.dbSet.setValue(a, r.fieldName, row[r.fieldName]);
                    }
                    data.push(a);
                }
                return data;
            }
        });
    }
    unique() {
        return this.list().then((l) => {
            if (l.length > 1) {
                throw "More than one row found";
            }
            else {
                return l[0];
            }
        });
    }
    // Conditional Functions
    where(func, ...args) {
        let a = this.dbSet.getEntity(this.stat.collection.alias);
        let res = null;
        if (func) {
            res = func(a, args);
        }
        if (res instanceof Query.SqlExpression) {
            this.stat.where.add(res);
        }
        let s = new SimpleQueryable(this.stat, this.dbSet);
        return s;
    }
    groupBy(func) {
        let a = this.dbSet.getEntity(this.stat.collection.alias);
        let res = null;
        if (func) {
            res = func(a);
        }
        if (res instanceof Array) {
            for (let i = 0; i < res.length; i++) {
                this.stat.groupBy.push(res[i]._createExpr());
            }
        }
        let s = new SimpleQueryable(this.stat, this.dbSet);
        return s;
    }
    orderBy(func) {
        let a = this.dbSet.getEntity(this.stat.collection.alias);
        let res = null;
        if (func) {
            res = func(a);
        }
        if (res instanceof Array) {
            for (let i = 0; i < res.length; i++) {
                this.stat.orderBy.push(res[i]._createExpr());
            }
        }
        let s = new SimpleQueryable(this.stat, this.dbSet);
        return s;
    }
}
