"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ColumnType;
(function (ColumnType) {
    ColumnType[ColumnType["NUMBER"] = 1] = "NUMBER";
    ColumnType[ColumnType["STRING"] = 2] = "STRING";
    ColumnType[ColumnType["BOOLEAN"] = 3] = "BOOLEAN";
    ColumnType[ColumnType["DATE"] = 4] = "DATE";
    ColumnType[ColumnType["JSON"] = 5] = "JSON";
})(ColumnType || (ColumnType = {}));
exports.default = ColumnType;
