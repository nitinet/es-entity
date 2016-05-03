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
        return null;
    }

    update(entity: Entity): Promise<Entity> {
        return null;
    }

    insertOrUpdate(entity: Entity): Promise<Entity> {
        return null;
    }
    
    delete(entity: Entity): Promise<Entity> {
        return null;
    }

    findById(id: any): Promise<Entity> {
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

        stat.where.operator = Query.SqlOperator.Equal;
        let exps: Array<string> = new Array<string>();
        exps.push(this.mapping.primaryKeyField.name);
        exps.push(id.toString());
        stat.where.exps = exps;

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