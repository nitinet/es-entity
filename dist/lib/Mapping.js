"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FieldMapping {
    constructor(data) {
        this.name = null;
        this.type = null;
        Object.assign(this, data);
    }
}
exports.FieldMapping = FieldMapping;
class EntityMapping {
    constructor(data) {
        this.name = '';
        this.entityName = '';
        this.primaryKey = '';
        this.primaryKeyField = null;
        this.fields = new Map();
        if (data) {
            this.name = data.name;
            this.entityName = data.entityName;
            this.primaryKey = data.primaryKey;
            Reflect.ownKeys(data.fields).forEach((key) => {
                let val = data.fields[key];
                this.fields.set(key, new FieldMapping(val));
            });
            this.primaryKeyField = this.fields.get(this.primaryKey);
        }
    }
}
exports.EntityMapping = EntityMapping;
