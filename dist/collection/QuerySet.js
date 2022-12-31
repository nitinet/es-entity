import * as sql from '../sql/index.js';
import * as model from '../model/index.js';
import IQuerySet from './IQuerySet.js';
import JoinQuerySet from './JoinQuerySet.js';
class QuerySet extends IQuerySet {
    dbSet = null;
    alias = null;
    constructor(dbSet) {
        super();
        if (dbSet) {
            this.bind(dbSet);
        }
    }
    bind(dbSet) {
        if (dbSet) {
            this.dbSet = dbSet;
            this.context = this.dbSet.context;
            this.stat = new sql.Statement();
            this.alias = dbSet.mapping.name.charAt(0);
            this.stat.collection.value = dbSet.mapping.name;
            this.stat.collection.alias = this.alias;
        }
    }
    getEntity(alias) {
        alias = alias || this.stat.collection.alias;
        return this.dbSet.getEntity(alias);
    }
    async list() {
        this.stat.command = sql.types.Command.SELECT;
        let temp = new (this.dbSet.getEntityType());
        let targetKeys = Reflect.ownKeys(temp);
        let fields = this.dbSet.filterFields(targetKeys);
        this.stat.columns = this.dbSet.getColumnExprs(fields, this.alias);
        let result = await this.context.execute(this.stat);
        return this.mapData(this.dbSet.getEntityType(), result);
    }
    async select(TargetType) {
        this.stat.command = sql.types.Command.SELECT;
        let temp = new TargetType();
        let targetKeys = Reflect.ownKeys(temp);
        let fields = this.dbSet.filterFields(targetKeys);
        this.stat.columns = this.dbSet.getColumnExprs(fields, this.alias);
        let result = await this.context.execute(this.stat);
        return this.mapData(TargetType, result);
    }
    async selectPlain(keys) {
        this.stat.command = sql.types.Command.SELECT;
        let fields = this.dbSet.filterFields(keys);
        this.stat.columns = this.dbSet.getColumnExprs(fields, this.alias);
        let input = await this.context.execute(this.stat);
        let data = input.rows.map(row => {
            let obj = {};
            keys.forEach(key => {
                let fieldMapping = this.dbSet.mapping.fields.find(f => f.fieldName == key);
                let colName = fieldMapping.colName;
                obj[key] = row[colName] ?? row[colName.toLowerCase()] ?? row[colName.toUpperCase()];
            });
            return obj;
        });
        return data;
    }
    async mapData(TargetEntityType, input) {
        let data = input.rows.map(row => {
            let obj = new TargetEntityType();
            let keys = Reflect.ownKeys(obj);
            keys.forEach(key => {
                let field = Reflect.get(obj, key);
                let fieldMapping = this.dbSet.mapping.fields.find(f => f.fieldName == key);
                if (fieldMapping) {
                    let colName = fieldMapping.colName;
                    let val = row[colName] ?? row[colName.toLowerCase()] ?? row[colName.toUpperCase()];
                    Reflect.set(obj, key, val);
                }
                else if (field instanceof model.LinkObject || field instanceof model.LinkArray) {
                    field.bind(this.context);
                }
            });
            return obj;
        });
        return data;
    }
    where(param, ...args) {
        let res = null;
        if (param && param instanceof Function) {
            let a = new sql.OperatorEntity();
            res = param(a, args);
        }
        if (res && res instanceof sql.Expression && res.exps.length > 0) {
            this.stat.where = this.stat.where.add(res);
        }
        return this;
    }
    groupBy(param) {
        let res = null;
        if (param && param instanceof Function) {
            let a = new sql.OperatorEntity();
            res = param(a);
        }
        if (res && Array.isArray(res)) {
            res.forEach(a => {
                if (a instanceof sql.Expression && a.exps.length > 0) {
                    this.stat.groupBy.push(a);
                }
            });
        }
        return this;
    }
    orderBy(param) {
        let res = null;
        if (param && param instanceof Function) {
            let a = new sql.OperatorEntity();
            res = param(a);
        }
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
        if (!(param && param instanceof Function)) {
            throw new Error('Select Function not found');
        }
        let stat = new sql.Statement();
        stat.command = sql.types.Command.UPDATE;
        stat.collection.value = this.dbSet.mapping.name;
        let a = this.getEntity();
        let tempObj = param(a);
        let keys = Reflect.ownKeys(tempObj).filter(k => tempObj.getChangeProps().includes(k));
        keys.forEach((key) => {
            let field = this.dbSet.getKeyField(key);
            if (!field)
                return;
            let c1 = new sql.Expression(field.colName);
            let c2 = new sql.Expression('?');
            c2.args.push(Reflect.get(tempObj, key));
            let c = new sql.Expression(null, sql.types.Operator.Equal, c1, c2);
            stat.columns.push(c);
        });
        if (stat.columns.length > 0) {
            let result = await this.context.execute(stat);
            if (result.error) {
                throw result.error;
            }
        }
    }
    join(coll, param, joinType) {
        joinType = joinType | sql.types.Join.InnerJoin;
        let temp = null;
        if (param && param instanceof Function) {
            let a = this.getEntity();
            let b = coll.getEntity();
            temp = param(a, b);
        }
        if (temp && temp instanceof sql.Expression && temp.exps.length > 0) {
            return new JoinQuerySet(this, coll, joinType, temp);
        }
        else {
            throw new Error('Invalid Join');
        }
    }
}
export default QuerySet;
