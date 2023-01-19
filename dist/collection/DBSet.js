import Case from 'case';
import * as model from '../model/index.js';
class DBSet {
    entityType;
    tableName = null;
    entityName = null;
    columns = [];
    fieldMap = new Map();
    primaryFields = [];
    constructor(entityType) {
        this.entityType = entityType;
    }
    async bind(context, tableName) {
        this.entityName = this.entityType.name;
        this.tableName = tableName ?? Case.snake(this.entityName);
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
        let fieldMapping = new model.FieldMapping(key, column.field, column.primaryKey);
        this.fieldMap.set(key, fieldMapping);
        if (column.primaryKey)
            this.primaryFields.push(fieldMapping);
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