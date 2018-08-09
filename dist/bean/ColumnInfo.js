"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ColumnInfo {
    constructor() {
        this.field = '';
        this.type = '';
        this.nullable = false;
        this.primaryKey = false;
        this.default = '';
        this.extra = '';
    }
}
exports.default = ColumnInfo;
