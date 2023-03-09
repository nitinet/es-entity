import Case from 'case';
import * as bean from '../bean/index.js';
import * as model from '../model/index.js';
class DBSet {
    entityType;
    tableName;
    entityName;
    columns = [];
    fieldMap = new Map();
    primaryFields = [];
    constructor(entityType, tableName) {
        this.entityType = entityType;
        this.entityName = this.entityType.name;
        this.tableName = tableName ?? Case.snake(this.entityName);
    }
    async bind(context) {
        this.columns = await context.handler.getTableInfo(this.tableName);
        let obj = new this.entityType();
        let keys = Reflect.ownKeys(obj);
        keys.forEach(key => {
            this.bindField(key);
        });
        return this;
    }
    bindField(key) {
        let snakeCaseKey = Case.snake(key);
        let column = this.columns.find(col => col.field == key || col.field == snakeCaseKey);
        if (!column)
            return;
        this.checkColumnType(column, key);
        let fieldMapping = new model.FieldMapping(key, column.field, column.type, column.primaryKey);
        this.fieldMap.set(key, fieldMapping);
        if (column.primaryKey)
            this.primaryFields.push(fieldMapping);
    }
    checkColumnType(column, key) {
        let obj = new this.entityType();
        let designType = Reflect.getMetadata('design:type', obj, key);
        if (designType) {
            if ((column.type == bean.ColumnType.STRING && designType != String)
                || (column.type == bean.ColumnType.NUMBER && designType != Number)
                || (column.type == bean.ColumnType.BOOLEAN && designType != Boolean)
                || (column.type == bean.ColumnType.DATE && designType != Date)
                || (column.type == bean.ColumnType.BINARY && designType != Buffer)
                || (column.type == bean.ColumnType.ARRAY && designType != Array)
                || (column.type == bean.ColumnType.OBJECT
                    && (designType != Array || !(designType.prototype instanceof Object))))
                throw new Error(`Type mismatch found for Column: ${column.field} in Table:${this.tableName}`);
        }
    }
    getEntityType() {
        return this.entityType;
    }
    getField(key) {
        return this.fieldMap.get(key);
    }
    getPrimaryFields() {
        return this.primaryFields;
    }
    filterFields(props) {
        let fields = Array.from(this.fieldMap.values());
        return fields.filter(f => props.includes(f.fieldName));
    }
}
export default DBSet;
//# sourceMappingURL=DBSet.js.map