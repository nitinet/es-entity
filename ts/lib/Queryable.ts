/// <reference path="./../../typings/globals/node/index.d.ts" />

import fs = require("fs");
import path = require("path");
var overload = require("operator-overloading");

import Context from "./Context";
import Entity, {IEntityType, Field} from "./Entity";
import * as Mapping from "./Mapping";
import * as Query from "./Query";
import * as Handler from "./Handler";

interface whereFunc<T> {
    (source: T, ...args: any[]): boolean;
}

class Queryable<T> {
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

    getEntity(alias?: string): T {
        let a = new this.entityType();

        this.mapping.fields.forEach(k => {
            let q: any = a[k.fieldName];
            if (q instanceof Field) {
                let name = alias ? alias + "." + k.name : k.name;
                (<Field>q)._name = name;
            }
        });
        return a;
    }

    isUpdated(obj: any, key: string): boolean {
        return (<Field>obj[key])._updated ? true : false;
    }

    setValue(obj: any, key: string, value: any): void {
        (<Field>obj[key])._value = value;
    }

    getValue(obj: any, key: string): any {
        return (<Field>obj[key]).val;
    }

    insert(entity: T): Promise<T> {
        let stat: Query.SqlStatement = new Query.SqlStatement();
        stat.command = "insert";
        stat.collection.value = this.mapping.name;
        for (let i = 0; i < this.mapping.fields.length; i++) {
            let element = this.mapping.fields[i];
            if (this.isUpdated(entity, element.fieldName)) {
                let c: Query.SqlCollection = new Query.SqlCollection();
                c.value = element.name;
                stat.columns.push(c);

                let v: Query.SqlExpression = new Query.SqlExpression("?");
                v.args.push(this.getValue(entity, element.fieldName));
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
            if (this.isUpdated(entity, element.fieldName) && element != this.mapping.primaryKeyField) {
                let c1: Query.SqlExpression = new Query.SqlExpression(element.name);
                let c2: Query.SqlExpression = new Query.SqlExpression("?");
                c2.args.push(this.getValue(entity, element.fieldName));

                let c: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.Equal, c1, c2);
                stat.columns.push(c);
            }
        }

        let w1: Query.SqlExpression = new Query.SqlExpression(this.mapping.primaryKeyField.name);
        let w2: Query.SqlExpression = new Query.SqlExpression("?");
        w2.args.push(this.getValue(entity, this.mapping.primaryKeyField.fieldName));
        stat.where = new Query.SqlExpression(null, Query.Operator.Equal, w1, w2);

        if (stat.columns.length > 0) {
            return this.context.execute(stat).then<T>((result: Handler.ResultSet) => {
                if (result.error)
                    throw result.error;
                else
                    return this.get(this.getValue(entity, this.mapping.primaryKeyField.fieldName));
            });
        } else {
            return null;
        }
    }

    insertOrUpdate(entity: T): Promise<T> {
        if (this.getValue(entity, this.mapping.primaryKeyField.fieldName)) {
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
        w2.args.push(this.getValue(entity, this.mapping.primaryKeyField.fieldName));
        stat.where = new Query.SqlExpression(null, Query.Operator.Equal, w1, w2);
        return this.context.execute(stat).then(() => { });
    }

    get(id: any): Promise<T> {
        if (!this.mapping.primaryKeyField)
            throw "No Primary Field Found";

        if (!id)
            throw "Id parameter cannot be null";

        return this.where(function (a: any, id) {
            return id == a.id;
        }, id).then<T>((res) => {
            return res[0];
        });
    }

    where(func: whereFunc<T>, ...args: any[]): Promise<Array<T>> {
        let stat: Query.SqlStatement = new Query.SqlStatement();
        stat.command = "select";

        let alias = this.mapping.name.charAt(0);
        stat.collection.value = this.mapping.name;
        stat.collection.alias = alias;

        for (let i = 0; i < this.mapping.fields.length; i++) {
            let element = this.mapping.fields[i];
            let c: Query.SqlCollection = new Query.SqlCollection();
            c.value = alias + "." + element.name;
            c.alias = element.fieldName;
            stat.columns.push(c);
        }

        let a = this.getEntity(alias);
        let res = overload(func)(a, args);
        if (res instanceof Query.SqlExpression) {
            stat.where = res;
            return this.context.execute(stat).then<Array<T>>((result: Handler.ResultSet) => {
                if (result.rows.length == 0)
                    throw "No Result Found";
                else {
                    let data: Array<T> = new Array();
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
        } else {
            null;
        }
    }

}

export default Queryable;