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
        return null;
    }
    update(entity) {
        return null;
    }
    insertOrUpdate(entity) {
        return null;
    }
    delete(entity) {
        return null;
    }
    findById(id) {
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
        stat.where.operator = Query.SqlOperator.Equal;
        let exps = new Array();
        exps.push(this.mapping.primaryKeyField.name);
        exps.push(id.toString());
        stat.where.exps = exps;
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
