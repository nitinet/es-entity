export declare class PropertyTransformer {
    fields: Array<string>;
    assignObject(source: any, target?: any): any;
    assignEntity(target: any, ...sources: Array<any>): any;
}
