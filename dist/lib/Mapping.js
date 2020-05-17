export class FieldMapping {
    constructor(data) {
        this.name = null;
        this.type = null;
        Object.assign(this, data);
    }
}
export class EntityMapping {
    constructor(data) {
        this.name = '';
        this.entityName = '';
        this.primaryKey = '';
        this.primaryKeyField = null;
        this.fields = new Map();
        this.foreignRels = new Array();
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
//# sourceMappingURL=Mapping.js.map