export class FieldMapping {
    fieldName = null;
    colName = null;
    primaryKey = false;
    constructor(data) {
        Object.assign(this, data);
    }
}
export class EntityMapping {
    name = '';
    entityName = '';
    fields = new Array();
    foreignRels = new Array();
    constructor(data) {
        if (data) {
            this.name = data.name;
            this.entityName = data.entityName;
            data.fields.forEach((val) => {
                this.fields.push(new FieldMapping(val));
            });
        }
    }
}
