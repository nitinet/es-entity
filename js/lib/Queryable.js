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
        fs.readFile(filePath, "utf-8", (err, data) => {
            this.mapping = new Mapping.EntityMapping(JSON.parse(data));
        });
    }
    insert(entity) {
        let stat = new Query.SqlStatement();
        stat.command = "insert";
        stat.collection.value = this.mapping.name;
        for (var i = 0; i < this.mapping.fields.length; i++) {
            var element = this.mapping.fields[i];
            let c = new Query.SqlCollection();
            c.value = element.name;
            stat.columns.push(c);
            let v = new Query.SqlExpression();
            v.exps = Reflect.get(entity, element.fieldName);
            stat.values.push(v);
        }
        return this.context.execute(stat).then((result) => {
            return this.get(result.rowCount);
        });
    }
    update(entity) {
        let stat = new Query.SqlStatement();
        stat.command = "update";
        stat.collection.value = this.mapping.name;
        for (var i = 0; i < this.mapping.fields.length; i++) {
            var element = this.mapping.fields[i];
            if (element != this.mapping.primaryKeyField) {
                let c1 = new Query.SqlExpression(element.name);
                let c2 = new Query.SqlExpression(Reflect.get(entity, element.fieldName));
                let c = new Query.SqlExpression(null, Query.SqlOperator.Equal, c1, c2);
                stat.columns.push(c);
            }
        }
        let w1 = new Query.SqlExpression(this.mapping.primaryKeyField.name);
        let w2 = new Query.SqlExpression(Reflect.get(entity, this.mapping.primaryKeyField.fieldName));
        stat.where = new Query.SqlExpression(null, Query.SqlOperator.Equal, w1, w2);
        return this.context.execute(stat).then((result) => {
            return this.get(result.rowCount);
        });
    }
    insertOrUpdate(entity) {
        if (Reflect.get(entity, this.mapping.primaryKeyField.fieldName)) {
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
        let w2 = new Query.SqlExpression(Reflect.get(entity, this.mapping.primaryKeyField.fieldName));
        stat.where = new Query.SqlExpression(null, Query.SqlOperator.Equal, w1, w2);
        return this.context.execute(stat).then((result) => {
            return this.get(result.rowCount);
        });
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
        let w1 = new Query.SqlExpression(this.mapping.primaryKeyField.name);
        let w2 = new Query.SqlExpression(id.toString());
        stat.where = new Query.SqlExpression(null, Query.SqlOperator.Equal, w1, w2);
        return this.context.execute(stat).then((result) => {
            if (!result.rows[0])
                throw "No Result Found";
            else if (result.rowCount != 1)
                throw "Non Unique Result";
            else {
                let a = new this.entityType();
                Object.assign(a, result.rows[0]);
                return a;
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Queryable;
