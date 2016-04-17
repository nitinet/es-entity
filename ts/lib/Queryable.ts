/// <reference path="./../../typings/main/ambient/node/index.d.ts" />

import fs = require("fs");
import path = require("path");

import Context from "./Context";
import Entity, {IEntityType} from "./Entity";
import EntityMapping from "./EntityMapping";

class Queryable {
    entityType: IEntityType<Entity>;
    context: Context;
    mapping: EntityMapping;

    constructor(entityType: IEntityType<Entity>) {
        this.entityType = entityType;
    }

    bind(context: Context): void {
        this.context = context;
        let entityName: string = this.entityType.name;
        let filePath: string = path.join(context.mappingPath, entityName + ".json");
        fs.readFile(filePath, "utf-8", (err, data) => {
            this.mapping = new EntityMapping(JSON.parse(data));
        });
    }

    insert(entity: Entity) {
        let a = new this.entityType();
        return a;
    }

}

export default Queryable;