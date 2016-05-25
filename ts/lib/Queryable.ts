/// <reference path="./../../typings/globals/node/index.d.ts" />

import fs = require("fs");
import path = require("path");

import Context from "./Context";
import Entity, {IEntityType, Field} from "./Entity";
import * as Mapping from "./Mapping";
import * as Query from "./Query";
import * as Handler from "./Handler";

interface whereFunc<T> {
    (source: T, ...args: any[]): Query.SqlExpression;
}

interface arrFieldFunc<T> {
    (source: T): Query.SqlExpression[];
}

interface Queryable<T> {
    // Selection Functions
    list(): Promise<Array<T>>;
    unique(): Promise<T>;

    // Conditional Functions
    where(func?: whereFunc<T>, ...args: any[]): Queryable<T>;
    groupBy(func?: arrFieldFunc<T>): Queryable<T>;
    orderBy(func?: arrFieldFunc<T>): Queryable<T>;
}

class DBSet<T> implements Queryable<T> {
    entityType: IEntityType<T>;
    context: Context;
    mapping: Mapping.EntityMapping;

    constructor(entityType: IEntityType<T>) {
        this.entityType = entityType;
    }

    bind(context: Context): void {
        this.context = context;
        let entityName: string = this.entityType.name;
        let filePath: string = path.join(context.mappingPath, entityName + ".json");
        let data = fs.readFileSync(filePath, "utf-8");
        this.mapping = new Mapping.EntityMapping(JSON.parse(data));
    }

    getEntity(alias?: string): T {
        let a = new this.entityType();

        this.mapping.fields.forEach(k => {
            let q: any = a[k.fieldName];
            if (q instanceof Field) {
                (<Field>q)._name = k.name;
                (<Field>q)._alias = alias;
            }
        });
        return a;
    }

    isUpdated(obj: any, key: string): boolean {
        return (<Field>obj[key])._updated ? true : false;
    }

    setValue(obj: any, key: string, value: any): void {
        (<Field>obj[key])._value = value;
    }

    getValue(obj: any, key: string): any {
        return (<Field>obj[key]).val;
    }

    executeStatement(stat: Query.SqlStatement): Promise<Handler.ResultSet> {
        return this.context.execute(stat);
    }

    insert(entity: T): Promise<T> {
        let stat: Query.SqlStatement = new Query.SqlStatement();
        stat.command = "insert";
        stat.collection.value = this.mapping.name;
        for (let i = 0; i < this.mapping.fields.length; i++) {
            let f = this.mapping.fields[i];
            if (this.isUpdated(entity, f.fieldName)) {
                let c: Query.SqlCollection = new Query.SqlCollection();
                c.value = f.name;
                stat.columns.push(c);

                let v: Query.SqlExpression = new Query.SqlExpression("?");
                v.args.push(this.getValue(entity, f.fieldName));
                stat.values.push(v);
            }
        }

        return this.context.execute(stat).then<T>((result: Handler.ResultSet) => {
            return this.get(result.id);
        });
    }

    update(entity: T): Promise<T> {
        let stat: Query.SqlStatement = new Query.SqlStatement();
        stat.command = "update";
        stat.collection.value = this.mapping.name;
        for (let i = 0; i < this.mapping.fields.length; i++) {
            let f = this.mapping.fields[i];
            if (this.isUpdated(entity, f.fieldName) && f != this.mapping.primaryKeyField) {
                let c1: Query.SqlExpression = new Query.SqlExpression(f.name);
                let c2: Query.SqlExpression = new Query.SqlExpression("?");
                c2.args.push(this.getValue(entity, f.fieldName));

                let c: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.Equal, c1, c2);
                stat.columns.push(c);
            }
        }

        let w1: Query.SqlExpression = new Query.SqlExpression(this.mapping.primaryKeyField.name);
        let w2: Query.SqlExpression = new Query.SqlExpression("?");
        w2.args.push(this.getValue(entity, this.mapping.primaryKeyField.fieldName));
        stat.where = new Query.SqlExpression(null, Query.Operator.Equal, w1, w2);

        if (stat.columns.length > 0) {
            return this.context.execute(stat).then<T>((result: Handler.ResultSet) => {
                if (result.error)
                    throw result.error;
                else
                    return this.get(this.getValue(entity, this.mapping.primaryKeyField.fieldName));
            });
        } else {
            return null;
        }
    }

    insertOrUpdate(entity: T): Promise<T> {
        if (this.getValue(entity, this.mapping.primaryKeyField.fieldName)) {
            return this.update(entity);
        } else {
            return this.insert(entity);
        }
    }

    delete(entity: T): Promise<void> {
        let stat: Query.SqlStatement = new Query.SqlStatement();
        stat.command = "delete";
        stat.collection.value = this.mapping.name;

        let w1: Query.SqlExpression = new Query.SqlExpression(this.mapping.primaryKeyField.name);
        let w2: Query.SqlExpression = new Query.SqlExpression("?");
        w2.args.push(this.getValue(entity, this.mapping.primaryKeyField.fieldName));
        stat.where = new Query.SqlExpression(null, Query.Operator.Equal, w1, w2);
        return this.context.execute(stat).then(() => { });
    }

    get(id: any): Promise<T> {
        if (!this.mapping.primaryKeyField)
            throw "No Primary Field Found";

        if (!id)
            throw "Id parameter cannot be null";

        return this.where((a: T, id) => {
            return (<Field>a[this.mapping.primaryKeyField.fieldName]).eq(id);
        }, id).unique();
    }

    where(func?: whereFunc<T>, ...args: any[]): Queryable<T> {
        let stat: Query.SqlStatement = new Query.SqlStatement();
        stat.command = "select";

        let alias = this.mapping.name.charAt(0);
        stat.collection.value = this.mapping.name;
        stat.collection.alias = alias;

        let a = this.getEntity(stat.collection.alias);
        let res: any = null;
        if (func) {
            res = func(a, args);
        }
        if (res instanceof Query.SqlExpression) {
            stat.where = res;
        }
        let s: SimpleQueryable<T> = new SimpleQueryable(stat, this);
        return s;
    }

    groupBy(func?: arrFieldFunc<T>): Queryable<T> {
        let q = this.where();
        return q.groupBy(func);
    }

    orderBy(func?: arrFieldFunc<T>): Queryable<T> {
        let q = this.where();
        return q.orderBy(func);
    }

    list(): Promise<Array<any>> {
        let q = this.where();
        return q.list();
    }

    unique(): Promise<T> {
        let q = this.where();
        return q.unique();
    }

}

/**
 * SimpleQueryable
 */
class SimpleQueryable<T> implements Queryable<T> {
    dbSet: DBSet<T> = null;
    stat: Query.SqlStatement = null;

    constructor(stat: Query.SqlStatement, dbSet: DBSet<T>) {
        this.stat = stat;
        this.dbSet = dbSet;
    }

    // Selection Functions
    list(): Promise<Array<any>> {
        let alias: string = this.stat.collection.alias;
        for (let i = 0; i < this.dbSet.mapping.fields.length; i++) {
            let e = this.dbSet.mapping.fields[i];
            let c: Query.SqlCollection = new Query.SqlCollection();
            c.colAlias = alias;
            c.value = e.name;
            c.alias = e.fieldName;
            this.stat.columns.push(c);
        }

        return this.dbSet.executeStatement(this.stat).then<Array<T>>((result: Handler.ResultSet) => {
            let data: Array<T> = new Array();
            for (let j = 0; j < result.rows.length; j++) {
                let row = result.rows[j];
                let a = this.dbSet.getEntity();
                for (let i = 0; i < this.dbSet.mapping.fields.length; i++) {
                    let r = this.dbSet.mapping.fields[i];
                    this.dbSet.setValue(a, r.fieldName, row[r.fieldName]);
                }
                data.push(a);
            }
            return data;
        });
    }

    // Selection Functions
    select(func?: arrFieldFunc<T>): Promise<Array<any>> {
        let cols: Query.SqlExpression[] = new Array();
        if (func) {
            let a = this.dbSet.getEntity(this.stat.collection.alias);
            let temp = func(a);
            for (var i = 0; i < temp.length; i++) {
                var e = temp[i];
                cols.push(e._createExpr());
            }
        } else {
            let alias: string = this.stat.collection.alias;
            for (let i = 0; i < this.dbSet.mapping.fields.length; i++) {
                let e = this.dbSet.mapping.fields[i];
                let c: Query.SqlCollection = new Query.SqlCollection();
                c.colAlias = alias;
                c.value = e.name;
                c.alias = e.fieldName;
                this.stat.columns.push(c);
            }
        }

        return this.dbSet.executeStatement(this.stat).then<Array<T>>((result: Handler.ResultSet) => {
            if (result.rows.length == 0)
                throw "No Result Found";
            else {
                let data: Array<T> = new Array();
                for (let j = 0; j < result.rows.length; j++) {
                    let row = result.rows[j];
                    let a = this.dbSet.getEntity();
                    for (let i = 0; i < this.dbSet.mapping.fields.length; i++) {
                        let r = this.dbSet.mapping.fields[i];
                        this.dbSet.setValue(a, r.fieldName, row[r.fieldName]);
                    }
                    data.push(a);
                }
                return data;
            }
        });
    }

    unique(): Promise<T> {
        return this.list().then<T>((l) => {
            if (l.length > 1) {
                throw "More than one row found";
            } else {
                return l[0];
            }
        });
    }

    // Conditional Functions
    where(func?: whereFunc<T>, ...args: any[]): Queryable<T> {
        let a = this.dbSet.getEntity(this.stat.collection.alias);
        let res: any = null;
        if (func) {
            res = func(a, args);
        }
        if (res instanceof Query.SqlExpression) {
            this.stat.where.add(res);
        }
        let s: SimpleQueryable<T> = new SimpleQueryable(this.stat, this.dbSet);
        return s;
    }

    groupBy(func?: arrFieldFunc<T>): Queryable<T> {
        let a = this.dbSet.getEntity(this.stat.collection.alias);
        let res: any = null;
        if (func) {
            res = func(a);
        }
        if (res instanceof Array) {
            for (let i = 0; i < res.length; i++) {
                this.stat.groupBy.push((<Query.Column>res[i])._createExpr());
            }
        }
        let s: SimpleQueryable<T> = new SimpleQueryable(this.stat, this.dbSet);
        return s;
    }

    orderBy(func?: arrFieldFunc<T>): Queryable<T> {
        let a = this.dbSet.getEntity(this.stat.collection.alias);
        let res: any = null;
        if (func) {
            res = func(a);
        }
        if (res instanceof Array) {
            for (let i = 0; i < res.length; i++) {
                this.stat.orderBy.push((<Query.Column>res[i])._createExpr());
            }
        }
        let s: SimpleQueryable<T> = new SimpleQueryable(this.stat, this.dbSet);
        return s;
    }

}

export {DBSet};
export default Queryable;