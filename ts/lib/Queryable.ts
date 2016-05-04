/// <reference path="./../../typings/main/ambient/node/index.d.ts" />

import fs = require("fs");
import path = require("path");

import Context from "./Context";
import Entity, {IEntityType} from "./Entity";
import * as Mapping from "./Mapping";
import * as Query from "./Sql/Query";
import * as Handler from "./Handler";

class Queryable {
    entityType: IEntityType<Entity>;
    context: Context;
    mapping: Mapping.EntityMapping;

    constructor(entityType: IEntityType<Entity>) {
        this.entityType = entityType;
    }

    bind(context: Context): void {
        this.context = context;
        let entityName: string = this.entityType.name;
        let filePath: string = path.join(context.mappingPath, entityName + ".json");
        fs.readFile(filePath, "utf-8", (err, data) => {
            this.mapping = new Mapping.EntityMapping(JSON.parse(data));
        });
    }

    insert(entity: Entity): Promise<Entity> {
        let stat: Query.SqlStatement = new Query.SqlStatement();
        stat.command = "insert";
        stat.collection.value = this.mapping.name;
        for (var i = 0; i < this.mapping.fields.length; i++) {
            var element = this.mapping.fields[i];
            let c: Query.SqlCollection = new Query.SqlCollection();
            c.value = element.name;
            stat.columns.push(c);

            let v: Query.SqlExpression = new Query.SqlExpression();
            v.exps = Reflect.get(entity, element.fieldName);
            stat.values.push(v);
        }

        return this.context.execute(stat).then<Entity>((result: Handler.ResultSet) => {
            return this.get(result.rowCount);
        });
    }

    update(entity: Entity): Promise<Entity> {
        let stat: Query.SqlStatement = new Query.SqlStatement();
        stat.command = "update";
        stat.collection.value = this.mapping.name;
        for (var i = 0; i < this.mapping.fields.length; i++) {
            var element = this.mapping.fields[i];
            if (element != this.mapping.primaryKeyField) {
                let c1: Query.SqlExpression = new Query.SqlExpression(element.name);
                let c2: Query.SqlExpression = new Query.SqlExpression(Reflect.get(entity, element.fieldName));

                let c: Query.SqlExpression = new Query.SqlExpression(null, Query.SqlOperator.Equal, c1, c2);
                stat.columns.push(c);
            }
        }

        let w1: Query.SqlExpression = new Query.SqlExpression(this.mapping.primaryKeyField.name);
        let w2: Query.SqlExpression = new Query.SqlExpression(Reflect.get(entity, this.mapping.primaryKeyField.fieldName));
        stat.where = new Query.SqlExpression(null, Query.SqlOperator.Equal, w1, w2);

        return this.context.execute(stat).then<Entity>((result: Handler.ResultSet) => {
            return this.get(result.rowCount);
        });
    }

    insertOrUpdate(entity: Entity): Promise<Entity> {
        if (Reflect.get(entity, this.mapping.primaryKeyField.fieldName)) {
            return this.update(entity);
        } else {
            return this.insert(entity);
        }
    }

    delete(entity: Entity): Promise<Entity> {
        let stat: Query.SqlStatement = new Query.SqlStatement();
        stat.command = "update";
        stat.collection.value = this.mapping.name;

        let w1: Query.SqlExpression = new Query.SqlExpression(this.mapping.primaryKeyField.name);
        let w2: Query.SqlExpression = new Query.SqlExpression(Reflect.get(entity, this.mapping.primaryKeyField.fieldName));
        stat.where = new Query.SqlExpression(null, Query.SqlOperator.Equal, w1, w2);

        return this.context.execute(stat).then<Entity>((result: Handler.ResultSet) => {
            return this.get(result.rowCount);
        });
    }

    get(id: any): Promise<Entity> {
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

        let w1: Query.SqlExpression = new Query.SqlExpression(this.mapping.primaryKeyField.name);
        let w2: Query.SqlExpression = new Query.SqlExpression(id.toString());
        stat.where = new Query.SqlExpression(null, Query.SqlOperator.Equal, w1, w2);

        return this.context.execute(stat).then<Entity>((result: Handler.ResultSet) => {
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

export default Queryable;