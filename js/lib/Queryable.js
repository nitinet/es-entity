/// <reference path="./../../typings/main/ambient/node/index.d.ts" />
"use strict";
const fs = require("fs");
const path = require("path");
const EntityMapping_1 = require("./EntityMapping");
class Queryable {
    constructor(entityType) {
        this.entityType = entityType;
    }
    bind(context) {
        this.context = context;
        let entityName = this.entityType.name;
        let filePath = path.join(context.mappingPath, entityName + ".json");
        fs.readFile(filePath, "utf-8", (err, data) => {
            this.mapping = new EntityMapping_1.default(JSON.parse(data));
        });
    }
    insert(entity) {
        let a = new this.entityType();
        return a;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Queryable;
