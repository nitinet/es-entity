import { Transform } from 'stream';
import * as model from '../model/index.js';
import * as sql from '../sql/index.js';
import DBSet from './DBSet.js';
import IQuerySet from './IQuerySet.js';
class SelectQuerySet extends IQuerySet {
    dbSet;
    EntityType;
    alias;
    stat = new sql.Statement();
    selectKeys;
    constructor(context, EntityType, dbSet) {
        super();
        this.context = context;
        this.EntityType = EntityType;
        this.dbSet = dbSet;
        this.alias = dbSet.tableName.charAt(0);
        this.stat.collection.value = dbSet.tableName;
        this.stat.collection.alias = this.alias;
        let temp = new this.EntityType();
        this.selectKeys = Reflect.ownKeys(temp);
    }
    prepareSelectStatement() {
        this.stat.command = sql.types.Command.SELECT;
        let temp = new this.EntityType();
        let targetKeys = Reflect.ownKeys(temp);
        let fields = this.dbSet.filterFields(targetKeys);
        this.stat.columns = this.getColumnExprs(fields, this.alias);
    }
    async list() {
        this.prepareSelectStatement();
        let result = await this.context.execute(this.stat);
        return result.rows.map(this.transformer);
    }
    transformer(row) {
        let obj = new this.EntityType();
        this.selectKeys.forEach(key => {
            let fieldMapping = this.dbSet.fieldMap.get(key);
            if (fieldMapping) {
                let colName = fieldMapping.colName;
                let val = row[colName];
                Reflect.set(obj, key, val);
            }
            else {
                let field = Reflect.get(obj, key);
                if (field instanceof model.LinkObject || field instanceof model.LinkArray) {
                    field.bind(this.context, obj);
                }
            }
        });
        return obj;
    }
    async stream() {
        this.prepareSelectStatement();
        let dataStream = await this.context.stream(this.stat);
        let that = this;
        return dataStream.pipe(new Transform({
            transform(chunk, encoding, callback) {
                callback(null, that.transformer(chunk));
            }
        }));
    }
    async listPlain(keys) {
        this.stat.command = sql.types.Command.SELECT;
        let fields = this.dbSet.filterFields(keys);
        this.stat.columns = this.getColumnExprs(fields, this.alias);
        let input = await this.context.execute(this.stat);
        let data = input.rows.map(row => {
            let obj = {};
            fields.forEach(field => {
                let colName = field.colName;
                let val = row[colName] ?? row[colName.toLowerCase()] ?? row[colName.toUpperCase()];
                Reflect.set(obj, field.fieldName, val);
            });
            return obj;
        });
        return data;
    }
    select(EntityType) {
        let keys = Reflect.ownKeys(new this.EntityType());
        let cols = Array.from(this.dbSet.fieldMap.entries()).filter(a => keys.includes(a[0]));
        let newDbSet = new DBSet();
        newDbSet.fieldMap = new Map(cols);
        let res = new SelectQuerySet(this.context, EntityType, newDbSet);
        return res;
    }
    where(param, ...args) {
        let fieldMap = new Map(Array.from(this.dbSet.fieldMap));
        let eb = new model.WhereExprBuilder(fieldMap);
        let res = param(eb, args);
        if (res && res instanceof sql.Expression && res.exps.length > 0) {
            this.stat.where = this.stat.where.add(res);
        }
        return this;
    }
    groupBy(param) {
        let fieldMap = new Map(Array.from(this.dbSet.fieldMap));
        let eb = new model.GroupExprBuilder(fieldMap);
        let res = param(eb);
        if (res && Array.isArray(res)) {
            res.forEach(expr => {
                if (expr instanceof sql.Expression && expr.exps.length > 0) {
                    this.stat.groupBy.push(expr);
                }
            });
        }
        return this;
    }
    orderBy(param) {
        let fieldMap = new Map(Array.from(this.dbSet.fieldMap));
        let eb = new model.OrderExprBuilder(fieldMap);
        let res = param(eb);
        if (res && Array.isArray(res)) {
            res.forEach(a => {
                if (a instanceof sql.Expression && a.exps.length > 0) {
                    this.stat.orderBy.push(a);
                }
            });
        }
        return this;
    }
    limit(size, index) {
        this.stat.limit = new sql.Expression(null, sql.types.Operator.Limit);
        this.stat.limit.exps.push(new sql.Expression(size.toString()));
        if (index) {
            this.stat.limit.exps.push(new sql.Expression(index.toString()));
        }
        return this;
    }
}
export default SelectQuerySet;
//# sourceMappingURL=SelectQuerySet.js.map