export interface IEntityType<T extends Entity> {
    new (): T;
}

class Entity {
    protected _updateMap: Map<string, boolean> = new Map<string, boolean>();
    protected _valMap: Map<string, any> = new Map<string, any>();

    constructor() {
    }

    isUpdated(key: string): boolean {
        return this._updateMap.get(key) ? true : false;
    }

    getValue(key: string): any {
        return Reflect.get(this, key);
    }

    setValue(key: string, value: any): void {
        this._valMap[key] = value;
    }
}

export default Entity;
