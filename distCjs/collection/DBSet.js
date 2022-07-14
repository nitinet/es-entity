"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const case_1 = require("case");
const bean = require("../bean/index.js");
const sql = require("../sql/index.js");
const types = require("../types/index.js");
const Mapping = require("../Mapping.js");
const IQuerySet_js_1 = require("./IQuerySet.js");
const QuerySet_js_1 = require("./QuerySet.js");
class DBSet extends IQuerySet_js_1.default {
    constructor(entityType, options) {
        super();
        this.options = null;
        this.mapping = new Mapping.EntityMapping();
        this.columns = null;
        this.entityType = entityType;
        this.options = options || {};
        this.options.entityName = this.options.entityName || this.entityType.name;
    }
    async bind() {
        let filePath = null;
        if (this.options.entityPath) {
            filePath = this.options.entityPath;
        }
        else if (this.context.getEntityPath()) {
            filePath = path.join(this.context.getEntityPath(), this.options.entityName + '.json');
        }
        if (filePath && fs.statSync(filePath).isFile()) {
            let data = fs.readFileSync(filePath, 'utf-8');
            this.mapping = new Mapping.EntityMapping(JSON.parse(data));
        }
        else {
            this.mapping = new Mapping.EntityMapping();
            this.mapping.entityName = this.options.entityName;
            this.mapping.name = case_1.default.snake(this.options.entityName);
            this.columns = await this.context.handler.getTableInfo(this.mapping.name);
            let obj = new this.entityType();
            let keys = Reflect.ownKeys(obj);
            keys.forEach(key => {
                let field = obj[key];
                if (field instanceof sql.Field) {
                    this.bindField(key.toString(), field);
                }
            });
        }
        return this;
    }
    bindField(key, field) {
        let colName = case_1.default.snake(key);
        let column = this.columns.filter(col => {
            return col.field == colName;
        })[0];
        try {
            if (!column) {
                throw new Error(`Column: ${colName} not found in Table: ${this.mapping.name}`);
            }
            let fieldMapping = new Mapping.FieldMapping({
                fieldName: key,
                colName: colName
            });
            fieldMapping.type = this.checkColumnType(column, field);
            if (column.primaryKey) {
                fieldMapping.primaryKey = true;
            }
            this.mapping.fields.push(fieldMapping);
        }
        catch (err) {
            this.context.log(err);
        }
    }
    checkColumnType(column, field) {
        if (column.type == bean.ColumnType.STRING && field instanceof types.String) {
            return 'string';
        }
        else if (column.type == bean.ColumnType.NUMBER && field instanceof types.Number) {
            return 'number';
        }
        else if (column.type == bean.ColumnType.NUMBER && field instanceof types.BigInt) {
            return 'bigint';
        }
        else if (column.type == bean.ColumnType.BOOLEAN && field instanceof types.Boolean) {
            return 'boolean';
        }
        else if (column.type == bean.ColumnType.DATE && field instanceof types.Date) {
            return 'date';
        }
        else if (column.type == bean.ColumnType.BINARY && field instanceof types.Binary) {
            return 'binary';
        }
        else if (column.type == bean.ColumnType.JSON && field instanceof types.Json) {
            return 'jsonObject';
        }
        else if (field instanceof types.String) {
            this.context.log(`Type not found for Column: ${column.field} in Table:${this.mapping.name}. Using default string type.`);
            return 'string';
        }
        else {
            throw new Error(`Type mismatch found for Column: ${column.field} in Table:${this.mapping.name}`);
        }
    }
    getEntityType() {
        return this.entityType;
    }
    getKeyField(key) {
        return this.mapping.fields.filter(a => {
            return a.fieldName == key;
        })[0];
    }
    getEntity(alias) {
        let a = new this.entityType();
        let keys = Reflect.ownKeys(a);
        keys.forEach(key => {
            let field = a[key];
            if (field instanceof sql.Field) {
                let fieldInfo = this.getKeyField(key);
                field._name = fieldInfo && fieldInfo.colName ? fieldInfo.colName : '';
                field._alias = alias;
                field._updated = false;
            }
            else if (field instanceof types.LinkObject || field instanceof types.LinkArray) {
                field.bind(this.context);
            }
        });
        return a;
    }
    getValue(obj, key) {
        return obj[key].get();
    }
    async insert(entity) {
        let stat = new sql.Statement();
        stat.command = sql.types.Command.INSERT;
        stat.collection.value = this.mapping.name;
        Reflect.ownKeys(entity).forEach((key) => {
            let q = entity[key];
            if (q instanceof sql.Field && q._updated) {
                let field = this.getKeyField(key);
                let col = new sql.Collection();
                col.value = field.colName;
                stat.columns.push(col);
                let v = new sql.Expression('?');
                v.args.push(this.getValue(entity, key));
                stat.values.push(v);
            }
        });
        let result = await this.context.execute(stat);
        let primaryFields = this.getPrimaryFields();
        if (primaryFields.length == 1) {
            let primaryField = primaryFields[0];
            let id = result.id || this.getValue(entity, primaryField.fieldName);
            try {
                return await this.get(id);
            }
            catch (err) {
                return null;
            }
        }
        else if (primaryFields.length > 1) {
            let param = {};
            primaryFields.forEach(field => {
                param[field.fieldName] = this.getValue(entity, field.fieldName);
            });
            return this.get(param);
        }
    }
    getPrimaryFields() {
        return this.mapping.fields.filter(f => {
            return f.primaryKey;
        });
    }
    whereExpr(entity) {
        let primaryFields = this.getPrimaryFields();
        if (!(primaryFields && primaryFields.length)) {
            throw new bean.SqlException('Primary Key fields not found');
        }
        let whereExpr = new sql.Expression();
        primaryFields.forEach(priField => {
            let w1 = new sql.Expression(priField.colName);
            let w2 = new sql.Expression('?');
            w2.args.push(this.getValue(entity, priField.fieldName));
            whereExpr = whereExpr.add(new sql.Expression(null, sql.types.Operator.Equal, w1, w2));
        });
        return whereExpr;
    }
    async update(entity) {
        let stat = new sql.Statement();
        stat.command = sql.types.Command.UPDATE;
        stat.collection.value = this.mapping.name;
        let primaryFields = this.getPrimaryFields();
        Reflect.ownKeys(entity).forEach((key) => {
            let field = this.getKeyField(key);
            let q = entity[key];
            let isPrimaryField = false;
            for (let f of primaryFields) {
                if (f.fieldName == field.fieldName) {
                    isPrimaryField = true;
                    break;
                }
            }
            if (q instanceof sql.Field && q._updated && !isPrimaryField) {
                let c1 = new sql.Expression(field.colName);
                let c2 = new sql.Expression('?');
                c2.args.push(this.getValue(entity, key));
                let c = new sql.Expression(null, sql.types.Operator.Equal, c1, c2);
                stat.columns.push(c);
            }
        });
        stat.where = this.whereExpr(entity);
        if (stat.columns.length > 0) {
            let result = await this.context.execute(stat);
            if (result.error) {
                throw result.error;
            }
            else if (primaryFields.length == 1) {
                let param = this.getValue(entity, primaryFields[0].fieldName);
                return this.get(param);
            }
            else {
                let param = {};
                primaryFields.forEach(field => {
                    param[field.fieldName] = this.getValue(entity, field.fieldName);
                });
                return this.get(param);
            }
        }
        else {
            return entity;
        }
    }
    async insertOrUpdate(entity) {
        let primaryFields = this.getPrimaryFields();
        let param = {};
        primaryFields.forEach(field => {
            param[field.fieldName] = this.getValue(entity, field.fieldName);
        });
        let obj = await this.get(param);
        if (obj) {
            return this.update(entity);
        }
        else {
            return this.insert(entity);
        }
    }
    async delete(entity) {
        let stat = new sql.Statement();
        stat.command = sql.types.Command.DELETE;
        stat.collection.value = this.mapping.name;
        stat.where = this.whereExpr(entity);
        await this.context.execute(stat);
    }
    async get(id) {
        if (id == null) {
            throw new Error('Id parameter cannot be null');
        }
        let primaryFields = this.getPrimaryFields();
        if (primaryFields.length == 0) {
            throw new Error('No Primary Field Found in Table: ' + this.mapping.name);
        }
        else if (primaryFields.length == 1) {
            if (typeof id === 'object') {
                let field = primaryFields[0];
                return this.where((a) => {
                    return a[field.fieldName].eq(id[field.fieldName]);
                }).unique();
            }
            else {
                let field = primaryFields[0];
                return this.where((a) => {
                    return a[field.fieldName].eq(id);
                }).unique();
            }
        }
        else if (primaryFields.length > 1 && typeof id === 'object') {
            let whereExpr = new sql.Expression();
            primaryFields.forEach(priField => {
                let w1 = new sql.Expression(priField.colName);
                let w2 = new sql.Expression('?');
                w2.args.push(id[priField.fieldName]);
                whereExpr = whereExpr.add(new sql.Expression(null, sql.types.Operator.Equal, w1, w2));
            });
            return this.where(whereExpr).unique();
        }
    }
    where(param, ...args) {
        let q = new QuerySet_js_1.default(this);
        let res = null;
        if (param) {
            if (param instanceof Function) {
                let a = this.getEntity(q.alias);
                res = param(a, args);
            }
            else {
                res = param;
            }
        }
        if (res && res instanceof sql.Expression && res.exps.length > 0) {
            q.stat.where = q.stat.where.add(res);
        }
        return q;
    }
    groupBy(func) {
        let q = this.where();
        return q.groupBy(func);
    }
    orderBy(func) {
        let q = this.where();
        return q.orderBy(func);
    }
    limit(size, index) {
        let q = this.where();
        return q.limit(size, index);
    }
    list() {
        let q = this.where();
        return q.list();
    }
    unique() {
        let q = this.where();
        return q.unique();
    }
    select(param) {
        let q = this.where();
        return q.select(param);
    }
    async mapData(input) {
        let data = new Array();
        await Promise.all(input.rows.map(async (row) => {
            let obj = this.getEntity();
            let keys = Reflect.ownKeys(obj);
            keys.filter(key => {
                let field = obj[key];
                return field instanceof sql.Field;
            }).forEach(key => {
                let fieldMapping = this.mapping.fields.find(f => {
                    return f.fieldName == key;
                });
                if (fieldMapping) {
                    let val = this.context.handler.mapData(row, fieldMapping.colName, fieldMapping.type);
                    let field = obj[key];
                    field.set(val);
                    field._updated = false;
                }
            });
            await Promise.all(keys.filter(key => {
                let field = obj[key];
                return (field instanceof types.LinkObject || field instanceof types.LinkArray);
            }).map(async (key) => {
                let field = obj[key];
                await field.apply(obj);
            }));
            data.push(obj);
        }));
        return data;
    }
    join(coll, param, joinType) {
        let q = this.where();
        return q.join(coll, param, joinType);
    }
}
exports.default = DBSet;
//# sourceMappingURL=DBSet.js.map