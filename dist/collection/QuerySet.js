import * as sql from '../sql/index.js';
import * as model from '../model/index.js';
import IQuerySet from './IQuerySet.js';
import JoinQuerySet from './JoinQuerySet.js';
class QuerySet extends IQuerySet {
    dbSet;
    alias;
    stat = new sql.Statement();
    EntityType;
    constructor(context, dbSet) {
        super();
        this.context = context;
        if (!dbSet)
            throw new TypeError('Invalid Entity');
        this.dbSet = dbSet;
        this.bind(dbSet);
        this.EntityType = this.dbSet.getEntityType();
    }
    bind(dbSet) {
        this.alias = dbSet.tableName.charAt(0);
        this.stat.collection.value = dbSet.tableName;
        this.stat.collection.alias = this.alias;
    }
    getEntity() {
        let res = new this.EntityType();
        return res;
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
    async select(TargetType) {
        return new Array();
    }
    async selectPlain(keys) {
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
    async mapData(input) {
        let data = input.rows.map(row => {
            let obj = new this.EntityType();
            let keys = Reflect.ownKeys(obj);
            keys.forEach(key => {
                let field = Reflect.get(obj, key);
                let fieldMapping = this.dbSet.fieldMap.get(key);
                if (fieldMapping) {
                    let colName = fieldMapping.colName;
                    let val = row[colName] ?? row[colName.toLowerCase()] ?? row[colName.toUpperCase()];
                    Reflect.set(obj, key, val);
                }
                else if (field instanceof model.LinkObject || field instanceof model.LinkArray) {
                    field.bind(this.context, obj);
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
    async update(param) {
        this.stat.command = sql.types.Command.UPDATE;
        let obj = this.getEntity();
        let tempObj = param(obj);
        let fields = this.dbSet.filterFields(Reflect.ownKeys(tempObj.obj))
            .filter(field => tempObj.updatedKeys.includes(field.fieldName));
        fields.forEach((field) => {
            let c1 = new sql.Expression(field.colName);
            let c2 = new sql.Expression('?');
            let val = Reflect.get(tempObj, field.fieldName);
            c2.args.push(val);
            let expr = new sql.Expression(null, sql.types.Operator.Equal, c1, c2);
            this.stat.columns.push(expr);
        });
        if (this.stat.columns.length > 0) {
            let result = await this.context.execute(this.stat);
            if (result.error)
                throw result.error;
        }
    }
    async delete() {
        this.stat.command = sql.types.Command.DELETE;
        let result = await this.context.execute(this.stat);
        if (result.error)
            throw result.error;
    }
    join(coll, param, joinType) {
        joinType = joinType ?? sql.types.Join.InnerJoin;
        let temp = null;
        if (param && param instanceof Function) {
            let mainObj = this.getEntity();
            let joinObj = coll.getEntity();
            temp = param(mainObj, joinObj);
        }
        if (!(temp && temp instanceof sql.Expression && temp.exps.length > 0))
            throw new Error('Invalid Join');
        return new JoinQuerySet(this, coll, joinType, temp);
    }
}
export default QuerySet;
//# sourceMappingURL=QuerySet.js.map