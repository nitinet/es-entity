import * as fs from 'fs';
import * as path from 'path';
import Case from 'case';
import * as bean from '../bean/index.js';
import * as sql from '../sql/index.js';
import * as Mapping from '../Mapping.js';
import * as model from '../model/index.js';
import IQuerySet from './IQuerySet.js';
import QuerySet from './QuerySet.js';
class DBSet extends IQuerySet {
    entityType;
    options = null;
    mapping = new Mapping.EntityMapping();
    columns = null;
    constructor(entityType, options) {
        super();
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
            this.mapping.name = Case.snake(this.options.entityName);
            this.columns = await this.context.handler.getTableInfo(this.mapping.name);
            let obj = new this.entityType();
            let keys = Reflect.ownKeys(obj);
            keys.forEach(key => {
                this.bindField(key);
            });
        }
        return this;
    }
    bindField(key) {
        let colName = Case.snake(key);
        let column = this.columns.find(col => {
            return col.field == colName;
        });
        try {
            if (!column) {
                throw new Error(`Column: ${colName} not found in Table: ${this.mapping.name}`);
            }
            let fieldMapping = new Mapping.FieldMapping({
                fieldName: key,
                colName: colName
            });
            if (column.primaryKey) {
                fieldMapping.primaryKey = true;
            }
            this.mapping.fields.push(fieldMapping);
        }
        catch (err) {
            this.context.log(err);
        }
    }
    getEntityType() {
        return this.entityType;
    }
    getKeyField(key) {
        return this.mapping.fields.find(a => a.fieldName == key);
    }
    getEntity(alias) {
        let a = new this.entityType();
        let keys = Reflect.ownKeys(a);
        keys.forEach(key => {
            let field = Reflect.get(a, key);
            if (field instanceof model.LinkObject || field instanceof model.LinkArray) {
                field.bind(this.context);
            }
        });
        return a;
    }
    async insert(entity) {
        let stat = new sql.Statement();
        stat.command = sql.types.Command.INSERT;
        stat.collection.value = this.mapping.name;
        Reflect.ownKeys(entity).forEach((key) => {
            let field = this.getKeyField(key);
            if (!field)
                return;
            let col = new sql.Collection();
            col.value = field.colName;
            stat.columns.push(col);
            let v = new sql.Expression('?');
            v.args.push(Reflect.get(entity, key));
            stat.values.push(v);
        });
        let result = await this.context.execute(stat);
        let primaryFields = this.getPrimaryFields();
        if (primaryFields.length == 1) {
            let primaryField = primaryFields[0];
            let id = result.id || Reflect.get(entity, primaryField.fieldName);
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
                Reflect.set(param, field.fieldName, Reflect.get(entity, field.fieldName));
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
            w2.args.push(Reflect.get(entity, priField.fieldName));
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
            if (!field)
                return;
            let isPrimaryField = false;
            for (let f of primaryFields) {
                if (f.fieldName == field.fieldName) {
                    isPrimaryField = true;
                    break;
                }
            }
            if (!isPrimaryField) {
                let c1 = new sql.Expression(field.colName);
                let c2 = new sql.Expression('?');
                c2.args.push(Reflect.get(entity, key));
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
                let param = Reflect.get(entity, primaryFields[0].fieldName);
                return this.get(param);
            }
            else {
                let param = {};
                primaryFields.forEach(field => {
                    Reflect.set(param, field.fieldName, Reflect.get(entity, field.fieldName));
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
            Reflect.set(param, field.fieldName, Reflect.get(entity, field.fieldName));
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
        if (id == null)
            throw new Error('Id parameter cannot be null');
        let primaryFields = this.getPrimaryFields();
        if (primaryFields.length == 0) {
            throw new Error('No Primary Field Found in Table: ' + this.mapping.name);
        }
        else if (primaryFields.length == 1) {
            if (typeof id === 'object') {
                let field = primaryFields[0];
                return this.where((a) => {
                    return null;
                }).unique();
            }
            else {
                let field = primaryFields[0];
                return this.where((a) => {
                    return null;
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
            return null;
        }
    }
    filterFields(props) {
        return this.mapping.fields.filter(f => props.includes(f.fieldName));
    }
    getColumnExprs(fields, alias) {
        let exprs = fields.map(field => {
            let val = alias ? alias + '.' + field.colName : field.colName;
            return new sql.Expression(val);
        });
        return exprs;
    }
    where(param, ...args) {
        let q = new QuerySet(this);
        return q.where(param, args);
    }
    groupBy(func) {
        let q = new QuerySet(this);
        return q.groupBy(func);
    }
    orderBy(func) {
        let q = new QuerySet(this);
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
    select(TargetType) {
        let q = new QuerySet(this);
        return q.select(TargetType);
    }
    selectPlain(keys) {
        let q = new QuerySet(this);
        return q.selectPlain(keys);
    }
    join(coll, param, joinType) {
        let q = new QuerySet(this);
        return q.join(coll, param, joinType);
    }
}
export default DBSet;
