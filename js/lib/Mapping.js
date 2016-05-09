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
exports.FieldMapping = FieldMapping;
class EntityMapping {
    constructor(data) {
        this.name = null;
        this.entityName = null;
        this.dynamicInsert = false;
        this.dynamicUpdate = false;
        this.primaryKey = "";
        this.primaryKeyField = null;
        this.cacheEnabled = false;
        this.fields = new Array();
        Object.assign(this, data);
        for (let i = 0; i < this.fields.length; i++) {
            let element = this.fields[i];
            if (element.fieldName === this.primaryKey) {
                this.primaryKeyField = element;
            }
        }
    }
}
exports.EntityMapping = EntityMapping;
