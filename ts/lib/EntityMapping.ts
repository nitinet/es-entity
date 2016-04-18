class FieldMapping {
    name: string = null;
    fieldName: string = null;
    type: string = null;
    skipInsert: boolean = false;
    skipUpdate: boolean = false;

    constructor(data: string) {
        Object.assign(this, data);
    }
}

class EntityMapping {
    name: string = null;
    entityName: string = null;
    dynamicInsert: boolean = false;
    dynamicUpdate: boolean = false;
    primaryKeyField: string = null;
    fields: Array<FieldMapping> = new Array<FieldMapping>();

    constructor(data: string) {
        Object.assign(this, data);
    }
}

export default EntityMapping;