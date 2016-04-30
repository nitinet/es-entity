"use strict";
class FieldMapping {
    constructor(data) {
        this.name = null;
        this.fieldName = null;
        this.type = null;
        this.skipInsert = false;
        this.skipUpdate = false;
        Object.assign(this, data);
    }
}
class EntityMapping {
    constructor(data) {
        this.name = null;
        this.entityName = null;
        this.dynamicInsert = false;
        this.dynamicUpdate = false;
        this.primaryKeyField = null;
        this.cacheEnabled = false;
        this.fields = new Array();
        Object.assign(this, data);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EntityMapping;
