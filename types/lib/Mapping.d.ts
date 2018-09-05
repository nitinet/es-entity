export declare class FieldMapping {
    name: string;
    type: string;
    constructor(data: any);
}
export declare class EntityMapping {
    name: string;
    entityName: string;
    primaryKey: string;
    primaryKeyField: FieldMapping;
    fields: Map<string, FieldMapping>;
    foreignRels: string[];
    constructor(data?: any);
}
