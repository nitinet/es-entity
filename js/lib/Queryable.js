/// <reference path="./../../typings/globals/node/index.d.ts" />
"use strict";
const fs = require("fs");
const path = require("path");
var overload = require("operator-overloading");
const Entity_1 = require("./Entity");
const Mapping = require("./Mapping");
const Query = require("./Query");
class Queryable {
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
                let name = alias ? alias + "." + k.name : k.name;
                q._name = name;
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
    insert(entity) {
        let stat = new Query.SqlStatement();
        stat.command = "insert";
        stat.collection.value = this.mapping.name;
        for (let i = 0; i < this.mapping.fields.length; i++) {
            let element = this.mapping.fields[i];
            if (this.isUpdated(entity, element.fieldName)) {
                let c = new Query.SqlCollection();
                c.value = element.name;
                stat.columns.push(c);
                let v = new Query.SqlExpression("?");
                v.args.push(this.getValue(entity, element.fieldName));
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
            let element = this.mapping.fields[i];
            if (this.isUpdated(entity, element.fieldName) && element != this.mapping.primaryKeyField) {
                let c1 = new Query.SqlExpression(element.name);
                let c2 = new Query.SqlExpression("?");
                c2.args.push(this.getValue(entity, element.fieldName));
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
        return this.where(function (a, id) {
            return id == a.id;
        }, id).then((res) => {
            return res[0];
        });
    }
    where(func, ...args) {
        let stat = new Query.SqlStatement();
        stat.command = "select";
        let alias = this.mapping.name.charAt(0);
        stat.collection.value = this.mapping.name;
        stat.collection.alias = alias;
        for (let i = 0; i < this.mapping.fields.length; i++) {
            let element = this.mapping.fields[i];
            let c = new Query.SqlCollection();
            c.value = alias + "." + element.name;
            c.alias = element.fieldName;
            stat.columns.push(c);
        }
        let a = this.getEntity(alias);
        let res = overload(func)(a, args);
        if (res instanceof Query.SqlExpression) {
            stat.where = res;
            return this.context.execute(stat).then((result) => {
                if (result.rows.length == 0)
                    throw "No Result Found";
                else {
                    let data = new Array();
                    for (var j = 0; j < result.rows.length; j++) {
                        var row = result.rows[j];
                        let a = this.getEntity();
                        for (var i = 0; i < this.mapping.fields.length; i++) {
                            var r = this.mapping.fields[i];
                            this.setValue(a, r.fieldName, row[r.fieldName]);
                        }
                        data.push(a);
                    }
                    return data;
                }
            });
        }
        else {
            null;
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Queryable;
