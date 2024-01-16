import * as model from '../model/index.js';
import * as sql from '../sql/index.js';
import IQuerySet from './IQuerySet.js';
class SelectQuerySet extends IQuerySet {
    dbSet;
    EntityType;
    alias;
    stat = new sql.Statement();
    constructor(context, EntityType, dbSet) {
        super();
        this.context = context;
        this.EntityType = EntityType;
        this.dbSet = dbSet;
        this.alias = dbSet.tableName.charAt(0);
        this.stat.collection.value = dbSet.tableName;
        this.stat.collection.alias = this.alias;
    }
    async list() {
        this.stat.command = sql.types.Command.SELECT;
        let temp = new this.EntityType();
        let targetKeys = Reflect.ownKeys(temp);
        let fields = this.dbSet.filterFields(targetKeys);
        this.stat.columns = this.getColumnExprs(fields, this.alias);
        let result = await this.context.execute(this.stat);
        return this.mapData(result);
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
        let res = new SelectQuerySet(this.context, EntityType, this.dbSet);
        return res;
    }
    async mapData(input) {
        let temp = new this.EntityType();
        let keys = Reflect.ownKeys(temp);
        let data = input.rows.map(row => {
            let obj = new this.EntityType();
            keys.forEach(key => {
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
        });
        return data;
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