"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const Case = require("case");
const sql = require("../sql");
const types = require("../types");
const Mapping = require("../Mapping");
const QuerySet_1 = require("./QuerySet");
const ForeignSet_1 = require("./ForeignSet");
class DBSet {
    constructor(entityType, options) {
        this.options = null;
        this.mapping = new Mapping.EntityMapping();
        this.columns = null;
        this.entityType = entityType;
        this.options = options || {};
        this.options.entityName = options.entityName ? options.entityName : this.entityType.name;
    }
    async bind(context) {
        this.context = context;
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
            this.mapping.name = Case.snake(this.options.entityName);
            this.columns = await this.context.handler.getTableInfo(this.mapping.name);
            let obj = new this.entityType();
            let keys = Reflect.ownKeys(obj);
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i].toString();
                let field = obj[key];
                if (field instanceof types.String || field instanceof types.Number || field instanceof types.Boolean || field instanceof types.Date || field instanceof types.Json) {
                    this.bindField(key);
                }
                else if (field instanceof ForeignSet_1.default) {
                    this.bindForeignRel(key);
                }
            }
        }
    }
    bindField(key) {
        let obj = new this.entityType();
        let field = obj[key];
        let name = Case.snake(key);
        let column = null;
        for (let j = 0; j < this.columns.length; j++) {
            let col = this.columns[j];
            if (col.field == name) {
                column = col;
                break;
            }
        }
        if (column) {
            let fieldMapping = new Mapping.FieldMapping({
                name: name
            });
            if (field instanceof types.String && column.type == 'string') {
                fieldMapping.type = 'string';
            }
            else if (field instanceof types.Number && column.type == 'number') {
                fieldMapping.type = 'number';
            }
            else if (field instanceof types.Boolean && column.type == 'boolean') {
                fieldMapping.type = 'boolean';
            }
            else if (field instanceof types.Date && column.type == 'date') {
                fieldMapping.type = 'date';
            }
            else if (field instanceof types.Json && column.type == 'string') {
                fieldMapping.type = 'jsonObject';
            }
            else {
                throw new Error('Type mismatch found for Column: ' + name + ' in Table:' + this.mapping.name);
            }
            this.mapping.fields.set(key, fieldMapping);
            if (column.primaryKey) {
                this.mapping.primaryKey = key;
                this.mapping.primaryKeyField = fieldMapping;
            }
        }
        else {
            throw new Error('Column: ' + name + ' not found in Table: ' + this.mapping.name);
        }
    }
    bindForeignRel(key) {
        this.mapping.foreignRels.push(key);
    }
    getEntityType() {
        return this.entityType;
    }
    getEntity(alias) {
        let a = new this.entityType();
        let keys = Reflect.ownKeys(a);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let q = a[key];
            if (q instanceof sql.Field) {
                let field = this.mapping.fields.get(key);
                q._name = field && field.name ? field.name : '';
                q._alias = alias;
            }
        }
        return a;
    }
    isUpdated(obj, key) {
        return obj[key]._updated ? true : false;
    }
    setValue(obj, key, value) {
        if (value != null) {
            obj[key] = value;
            obj[key]._updated = false;
        }
    }
    getValue(obj, key) {
        return obj[key];
    }
    async executeStatement(stat) {
        return await this.context.execute(stat);
    }
    async insert(entity) {
        let stat = new sql.Statement();
        stat.command = 'insert';
        stat.collection.value = this.mapping.name;
        await Reflect.ownKeys(entity).forEach((key) => {
            let q = entity[key];
            if (q instanceof sql.Field && this.isUpdated(entity, key)) {
                let f = this.mapping.fields.get(key);
                let c = new sql.Collection();
                c.value = f.name;
                stat.columns.push(c);
                let v = new sql.Expression('?');
                v.args.push(this.getValue(entity, key));
                stat.values.push(v);
            }
        });
        let result = await this.context.execute(stat);
        if (!result.id) {
            result.id = this.getValue(entity, this.mapping.primaryKey);
        }
        return await this.get(result.id);
    }
    async update(entity) {
        let stat = new sql.Statement();
        stat.command = 'update';
        stat.collection.value = this.mapping.name;
        await Reflect.ownKeys(entity).forEach((key) => {
            let f = this.mapping.fields.get(key);
            let q = entity[key];
            if (q instanceof sql.Field && this.isUpdated(entity, key) && f != this.mapping.primaryKeyField) {
                let c1 = new sql.Expression(f.name);
                let c2 = new sql.Expression('?');
                c2.args.push(this.getValue(entity, key));
                let c = new sql.Expression(null, sql.Operator.Equal, c1, c2);
                stat.columns.push(c);
            }
        });
        let w1 = new sql.Expression(this.mapping.primaryKeyField.name);
        let w2 = new sql.Expression('?');
        w2.args.push(this.getValue(entity, this.mapping.primaryKey));
        stat.where = new sql.Expression(null, sql.Operator.Equal, w1, w2);
        if (stat.columns.length > 0) {
            let result = await this.context.execute(stat);
            if (result.error)
                throw result.error;
            else
                return await this.get(this.getValue(entity, this.mapping.primaryKey));
        }
        else {
            return null;
        }
    }
    insertOrUpdate(entity) {
        if (this.getValue(entity, this.mapping.primaryKey)) {
            return this.update(entity);
        }
        else {
            return this.insert(entity);
        }
    }
    async delete(entity) {
        let stat = new sql.Statement();
        stat.command = 'delete';
        stat.collection.value = this.mapping.name;
        let w1 = new sql.Expression(this.mapping.primaryKeyField.name);
        let w2 = new sql.Expression('?');
        w2.args.push(this.getValue(entity, this.mapping.primaryKey));
        stat.where = new sql.Expression(null, sql.Operator.Equal, w1, w2);
        await this.context.execute(stat);
    }
    async get(id) {
        if (!this.mapping.primaryKeyField)
            throw new Error('No Primary Field Found in Table: ' + this.mapping.name);
        if (id == null)
            throw new Error('Id parameter cannot be null');
        let fieldName = this.mapping.primaryKey;
        return await this.where((a, id) => {
            return a[fieldName].eq(id);
        }, id).unique();
    }
    where(param, ...args) {
        let stat = new sql.Statement();
        stat.command = 'select';
        let alias = this.mapping.name.charAt(0);
        stat.collection.value = this.mapping.name;
        stat.collection.alias = alias;
        let res = null;
        if (param instanceof Function) {
            let a = this.getEntity(stat.collection.alias);
            res = param(a, args);
        }
        else {
            res = param;
        }
        if (res instanceof sql.Expression && res.exps.length > 0) {
            stat.where = res;
        }
        return new QuerySet_1.default(stat, this);
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
    mapData(input) {
        let q = this.where();
        return q.mapData(input);
    }
}
exports.default = DBSet;
