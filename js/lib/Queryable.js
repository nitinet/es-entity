/// <reference path="./../../typings/main/ambient/node/index.d.ts" />
"use strict";
const fs = require("fs");
const path = require("path");
const Mapping = require("./Mapping");
const Query = require("./Sql/Query");
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
    getEntity() {
        let a = new this.entityType();
        this.mapping.fields.forEach(k => {
            Object.defineProperty(a, k.fieldName, {
                get: function () {
                    return this._valMap[k.fieldName];
                },
                set: function (val) {
                    this._updateMap[k.fieldName] = true;
                    this._valMap[k.fieldName] = val;
                }
            });
        });
        return a;
    }
    insert(entity) {
        let stat = new Query.SqlStatement();
        stat.command = "insert";
        stat.collection.value = this.mapping.name;
        for (let i = 0; i < this.mapping.fields.length; i++) {
            let element = this.mapping.fields[i];
            if (entity.isUpdated(element.fieldName)) {
                let c = new Query.SqlCollection();
                c.value = element.name;
                stat.columns.push(c);
                let v = new Query.SqlExpression("?");
                v.args.push(entity.getValue(element.fieldName));
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
            if (entity.isUpdated(element.fieldName) && element != this.mapping.primaryKeyField) {
                let c1 = new Query.SqlExpression(element.name);
                let c2 = new Query.SqlExpression("?");
                c2.args.push(entity.getValue(element.fieldName));
                let c = new Query.SqlExpression(null, Query.SqlOperator.Equal, c1, c2);
                stat.columns.push(c);
            }
        }
        let w1 = new Query.SqlExpression(this.mapping.primaryKeyField.name);
        let w2 = new Query.SqlExpression("?");
        w2.args.push(entity.getValue(this.mapping.primaryKeyField.fieldName));
        stat.where = new Query.SqlExpression(null, Query.SqlOperator.Equal, w1, w2);
        return this.context.execute(stat).then((result) => {
            if (result.error)
                throw result.error;
            else
                return this.get(entity.getValue(this.mapping.primaryKeyField.fieldName));
        });
    }
    insertOrUpdate(entity) {
        if (entity.getValue(this.mapping.primaryKeyField.fieldName)) {
            return this.update(entity);
        }
        else {
            return this.insert(entity);
        }
    }
    delete(entity) {
        let stat = new Query.SqlStatement();
        stat.command = "update";
        stat.collection.value = this.mapping.name;
        let w1 = new Query.SqlExpression(this.mapping.primaryKeyField.name);
        let w2 = new Query.SqlExpression("?");
        w2.args.push(entity.getValue(this.mapping.primaryKeyField.fieldName));
        stat.where = new Query.SqlExpression(null, Query.SqlOperator.Equal, w1, w2);
        return this.context.execute(stat).then(() => { });
    }
    get(id) {
        if (!this.mapping.primaryKeyField)
            throw "No Primary Field Found";
        if (!id)
            throw "Id parameter cannot be null";
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
        let w1 = new Query.SqlExpression(alias + "." + this.mapping.primaryKeyField.name);
        let w2 = new Query.SqlExpression("?");
        w2.args.push(id);
        stat.where = new Query.SqlExpression(null, Query.SqlOperator.Equal, w1, w2);
        return this.context.execute(stat).then((result) => {
            if (!result.rows[0])
                throw "No Result Found";
            else if (result.rowCount != 1)
                throw "Non Unique Result";
            else {
                let a = this.getEntity();
                for (var i = 0; i < this.mapping.fields.length; i++) {
                    var r = this.mapping.fields[i];
                    a.setValue(r.fieldName, result.rows[0][r.fieldName]);
                }
                return a;
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Queryable;
