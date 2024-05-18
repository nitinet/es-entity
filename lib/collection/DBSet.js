class DBSet {
    tableName = '';
    fieldMap = new Map();
    filterFields(props) {
        let fields = Array.from(this.fieldMap.values());
        return fields.filter(f => props.includes(f.fieldName));
    }
}
export default DBSet;
//# sourceMappingURL=DBSet.js.map