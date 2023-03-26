class FieldMapping {
    fieldName;
    colName;
    columnType;
    primaryKey = false;
    constructor(fieldName, colName, columnType, primaryKey) {
        this.fieldName = fieldName;
        this.colName = colName;
        this.columnType = columnType;
        this.primaryKey = primaryKey;
    }
}
export default FieldMapping;
//# sourceMappingURL=FieldMapping.js.map