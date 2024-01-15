import * as decoratorKeys from '../decorators/Constants.js';
import { TABLE_COLUMN_KEYS } from '../decorators/Constants.js';
import * as model from '../model/index.js';
class DBSet {
    EntityType;
    tableName;
    fieldMap = new Map();
    primaryFields = [];
    constructor(EntityType) {
        this.EntityType = EntityType;
        let tableName = Reflect.getMetadata(decoratorKeys.TABLE_KEY, this.EntityType);
        if (!tableName)
            throw new Error('Table Name Not Found');
        this.tableName = tableName;
        this.bind();
    }
    bind() {
        let keys = Reflect.getMetadata(TABLE_COLUMN_KEYS, this.EntityType.prototype);
        keys.forEach(key => this.bindField(key));
        return this;
    }
    bindField(key) {
        let columnName = Reflect.getMetadata(decoratorKeys.COLUMN_KEY, this.EntityType.prototype, key);
        if (columnName) {
            let columnType = Reflect.getMetadata('design:type', this.EntityType.prototype, key);
            let primaryKey = Reflect.getMetadata(decoratorKeys.ID_KEY, this.EntityType.prototype, key) === true;
            let fieldMapping = new model.FieldMapping(key, columnName, columnType, primaryKey);
            this.fieldMap.set(key, fieldMapping);
            if (primaryKey)
                this.primaryFields.push(fieldMapping);
        }
    }
    getEntityType() {
        return this.EntityType;
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