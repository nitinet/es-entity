import * as model from '../model/index.js';
import * as sql from '../sql/index.js';
import DBSet from './DBSet.js';
import IQuerySet from './IQuerySet.js';
import SelectQuerySet from './SelectQuerySet.js';
class JoinQuerySet extends IQuerySet {
    mainSet;
    joinSet;
    stat = new sql.Statement();
    constructor(context, EntityType, mainSet, joinSet, joinType, expr) {
        super();
        this.context = context;
        this.EntityType = EntityType;
        this.mainSet = mainSet;
        this.joinSet = joinSet;
        let entries = [...Array.from(this.mainSet.dbSet.fieldMap.entries()), ...Array.from(this.joinSet.dbSet.fieldMap.entries())];
        this.dbSet.fieldMap = new Map(entries);
        this.stat = new sql.Statement();
        this.stat.collection.join = joinType;
        this.stat.where = this.stat.where.add(expr);
    }
    async list() {
        this.stat.command = sql.types.Command.SELECT;
        let temp = new this.EntityType();
        let targetKeys = Reflect.ownKeys(temp);
        let fields = this.dbSet.filterFields(targetKeys);
        this.stat.columns = this.getColumnExprs(fields);
        let result = await this.context.execute(this.stat);
        return this.mapData(result);
    }
    async listPlain(keys) {
        this.stat.command = sql.types.Command.SELECT;
        let fields = this.dbSet.filterFields(keys);
        this.stat.columns = this.getColumnExprs(fields);
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
export default JoinQuerySet;
//# sourceMappingURL=JoinQuerySet.js.map