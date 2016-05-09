"use strict";
class Entity {
    constructor() {
        this._updateMap = new Map();
        this._valMap = new Map();
    }
    isUpdated(key) {
        return this._updateMap.get(key) ? true : false;
    }
    getValue(key) {
        return Reflect.get(this, key);
    }
    setValue(key, value) {
        this._valMap[key] = value;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Entity;
