import * as decoratorKeys from '../decorators/Constants.js';
import * as model from '../model/index.js';
class DBSet {
    entityType;
    tableName;
    fieldMap = new Map();
    primaryFields = [];
    constructor(entityType) {
        this.entityType = entityType;
        this.tableName = Reflect.getMetadata(decoratorKeys.TABLE_KEY, this.entityType.prototype);
        this.bind();
    }
    bind() {
        let obj = new this.entityType();
        let keys = Reflect.ownKeys(obj);
        keys.forEach(key => this.bindField(key));
        return this;
    }
    bindField(key) {
        let columnName = Reflect.getMetadata(decoratorKeys.COLUMN_KEY, this.entityType.prototype, key);
        let columnType = Reflect.getMetadata('design:type', this.entityType.prototype, key);
        let primaryKey = Reflect.getMetadata(decoratorKeys.ID_KEY, this.entityType.prototype, key) === true;
        let fieldMapping = new model.FieldMapping(key, columnName, columnType, primaryKey);
        this.fieldMap.set(key, fieldMapping);
        if (primaryKey)
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