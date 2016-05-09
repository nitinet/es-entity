/// <reference path="./../../typings/main/ambient/node/index.d.ts" />

import fs = require("fs");
import path = require("path");

import Context from "./Context";
import Entity, {IEntityType} from "./Entity";
import * as Mapping from "./Mapping";
import * as Query from "./Sql/Query";
import * as Handler from "./Handler";

class Queryable<T extends Entity> {
    entityType: IEntityType<T>;
    context: Context;
    mapping: Mapping.EntityMapping;

    constructor(entityType: IEntityType<T>) {
        this.entityType = entityType;
    }

    bind(context: Context): void {
        this.context = context;
        let entityName: string = this.entityType.name;
        let filePath: string = path.join(context.mappingPath, entityName + ".json");
        let data = fs.readFileSync(filePath, "utf-8");
        this.mapping = new Mapping.EntityMapping(JSON.parse(data));
    }

    getEntity(): T {
        let a = new this.entityType();
        this.mapping.fields.forEach(k => {
            Object.defineProperty(a, k.fieldName, {
                get: function () {
                    return this._valMap.get(k.fieldName);
                },
                set: function (val) {
                    this._updateMap.set(k.fieldName, true);
                    this._valMap.set(k.fieldName, val);
                }
            });
        });
        return a;
    }

    insert(entity: T): Promise<T> {
        let stat: Query.SqlStatement = new Query.SqlStatement();
        stat.command = "insert";
        stat.collection.value = this.mapping.name;
        for (let i = 0; i < this.mapping.fields.length; i++) {
            let element = this.mapping.fields[i];
            if (entity.isUpdated(element.fieldName)) {
                let c: Query.SqlCollection = new Query.SqlCollection();
                c.value = element.name;
                stat.columns.push(c);

                let v: Query.SqlExpression = new Query.SqlExpression("?");
                v.args.push(entity.getValue(element.fieldName));
                stat.values.push(v);
            }
        }

        return this.context.execute(stat).then<T>((result: Handler.ResultSet) => {
            return this.get(result.id);
        });
    }

    update(entity: T): Promise<T> {
        let stat: Query.SqlStatement = new Query.SqlStatement();
        stat.command = "update";
        stat.collection.value = this.mapping.name;
        for (let i = 0; i < this.mapping.fields.length; i++) {
            let element = this.mapping.fields[i];
            if (entity.isUpdated(element.fieldName) && element != this.mapping.primaryKeyField) {
                let c1: Query.SqlExpression = new Query.SqlExpression(element.name);
                let c2: Query.SqlExpression = new Query.SqlExpression("?");
                c2.args.push(entity.getValue(element.fieldName));

                let c: Query.SqlExpression = new Query.SqlExpression(null, Query.SqlOperator.Equal, c1, c2);
                stat.columns.push(c);
            }
        }

        let w1: Query.SqlExpression = new Query.SqlExpression(this.mapping.primaryKeyField.name);
        let w2: Query.SqlExpression = new Query.SqlExpression("?");
        w2.args.push(entity.getValue(this.mapping.primaryKeyField.fieldName));
        stat.where = new Query.SqlExpression(null, Query.SqlOperator.Equal, w1, w2);

        return this.context.execute(stat).then<T>((result: Handler.ResultSet) => {
            if (result.error)
                throw result.error;
            else
                return this.get(entity.getValue(this.mapping.primaryKeyField.fieldName));
        });
    }

    insertOrUpdate(entity: T): Promise<T> {
        if (entity.getValue(this.mapping.primaryKeyField.fieldName)) {
            return this.update(entity);
        } else {
            return this.insert(entity);
        }
    }

    delete(entity: T): Promise<void> {
        let stat: Query.SqlStatement = new Query.SqlStatement();
        stat.command = "delete";
        stat.collection.value = this.mapping.name;

        let w1: Query.SqlExpression = new Query.SqlExpression(this.mapping.primaryKeyField.name);
        let w2: Query.SqlExpression = new Query.SqlExpression("?");
        w2.args.push(entity.getValue(this.mapping.primaryKeyField.fieldName));
        stat.where = new Query.SqlExpression(null, Query.SqlOperator.Equal, w1, w2);
        return this.context.execute(stat).then(() => { });
    }

    get(id: any): Promise<T> {
        if (!this.mapping.primaryKeyField)
            throw "No Primary Field Found";

        if (!id)
            throw "Id parameter cannot be null";

        let stat: Query.SqlStatement = new Query.SqlStatement();
        stat.command = "select";

        let alias = this.mapping.name.charAt(0);
        stat.collection.value = this.mapping.name;
        stat.collection.alias = alias

        for (let i = 0; i < this.mapping.fields.length; i++) {
            let element = this.mapping.fields[i];
            let c: Query.SqlCollection = new Query.SqlCollection();
            c.value = alias + "." + element.name;
            c.alias = element.fieldName;
            stat.columns.push(c);
        }

        let w1: Query.SqlExpression = new Query.SqlExpression(alias + "." + this.mapping.primaryKeyField.name);
        let w2: Query.SqlExpression = new Query.SqlExpression("?");
        w2.args.push(id);
        stat.where = new Query.SqlExpression(null, Query.SqlOperator.Equal, w1, w2);

        return this.context.execute(stat).then<T>((result: Handler.ResultSet) => {
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

export default Queryable;