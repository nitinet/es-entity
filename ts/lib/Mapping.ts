export class FieldMapping {
    name: string = null;
    fieldName: string = null;
    type: string = null;
    skipInsert: boolean = false;
    skipUpdate: boolean = false;

    constructor(data: string) {
        Object.assign(this, data);
    }
}

export class EntityMapping {
    name: string = null;
    entityName: string = null;
    dynamicInsert: boolean = false;
    dynamicUpdate: boolean = false;
    primaryKey: string = "";
    primaryKeyField: FieldMapping = null;
    cacheEnabled: boolean = false;
    fields: Array<FieldMapping> = new Array<FieldMapping>();

    constructor(data: string) {
        Object.assign(this, data);
        for (var i = 0; i < this.fields.length; i++) {
            var element = this.fields[i];
            if (element.fieldName === this.primaryKey) {
                this.primaryKeyField = element;
            }
        }
    }
}
