import { Readable, Transform } from 'stream';
import Context from '../Context.js';
import { TABLE_COLUMN_KEYS } from '../decorators/Constants.js';
import * as model from '../model/index.js';
import * as types from '../model/types.js';
import * as sql from '../sql/index.js';
import DBSet from './DBSet.js';
import IQuerySet from './IQuerySet.js';
import SelectQuerySet from './SelectQuerySet.js';

/**
 * QuerySet
 */
class QuerySet<T extends Object> extends IQuerySet<T> {
  protected EntityType: types.IEntityType<T>;
  protected dbSet: DBSet;

  alias: string;
  stat = new sql.Statement();

  selectKeys: string[];

  constructor(context: Context, EntityType: types.IEntityType<T>, dbSet: DBSet) {
    super();

    this.context = context;
    this.EntityType = EntityType;
    this.dbSet = dbSet;

    this.alias = this.dbSet.tableName.charAt(0);
    this.stat.collection.value = this.dbSet.tableName;
    this.stat.collection.alias = this.alias;

    this.selectKeys = Reflect.getMetadata(TABLE_COLUMN_KEYS, this.EntityType.prototype);
  }

  // getEntity() {
  // 	let res = new this.EntityType();
  // 	let keys: string[] = Reflect.getMetadata(TABLE_COLUMN_KEYS, this.EntityType.prototype);
  // 	keys.forEach(key => {
  // 		let field = Reflect.get(res, key);
  // 		if (field instanceof model.LinkObject || field instanceof model.LinkArray) {
  // 			field.bind(this.context, res);
  // 		}
  // 	});

  // 	return res;
  // }

  // Select Functions

  prepareSelectStatement() {
    this.stat.command = sql.types.Command.SELECT;

    // Get all Columns
    let targetKeys: string[] = Reflect.getMetadata(TABLE_COLUMN_KEYS, this.EntityType.prototype);
    let fields = this.dbSet.filterFields(targetKeys);
    this.stat.columns = this.getColumnExprs(fields, this.alias);
  }

  async list() {
    this.prepareSelectStatement();
    let result = await this.context.execute(this.stat);
    return result.rows.map(this.transformer);
  }

  transformer(row: any) {
    let obj = new this.EntityType();
    this.selectKeys.forEach(key => {
      let fieldMapping = this.dbSet.fieldMap.get(key);
      if (fieldMapping) {
        let colName = fieldMapping.colName;
        let val = row[colName];
        Reflect.set(obj, key, val);
      } else {
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
    let res = dataStream.pipeThrough(
      new TransformStream<any, T>({
        transform: (chunk, controller) => {
          if (chunk === null) controller.terminate();
          else controller.enqueue(this.transformer(chunk));
        }
      })
    );
    return res;
  }

  async listPlain(keys: (keyof T)[]): Promise<Partial<T>[]> {
    this.stat.command = sql.types.Command.SELECT;

    let fields = this.dbSet.filterFields(<string[]>keys);
    this.stat.columns = this.getColumnExprs(fields, this.alias);

    let input = await this.context.execute(this.stat);
    let data = input.rows.map(row => {
      let obj: Partial<T> = {};
      fields.forEach(field => {
        let colName = field.colName;
        let val = row[colName] ?? row[colName.toLowerCase()] ?? row[colName.toUpperCase()];
        Reflect.set(obj, field.fieldName, val);
      });
      return obj;
    });
    return data;
  }

  // Selection Functions
  select<U extends Object>(EntityType: types.IEntityType<U>): IQuerySet<U> {
    let res = new SelectQuerySet(this.context, EntityType, this.dbSet);
    return res;
  }

  // Conditional Functions
  where(param: types.IWhereFunc<model.WhereExprBuilder<T>>, ...args: any[]) {
    let fieldMap = new Map(Array.from(this.dbSet.fieldMap));
    let eb = new model.WhereExprBuilder<T>(fieldMap);
    let res = param(eb, args);
    if (res && res instanceof sql.Expression && res.exps.length > 0) {
      this.stat.where = this.stat.where.add(res);
    }
    return this;
  }

  groupBy(param: types.IArrFieldFunc<model.GroupExprBuilder<T>>) {
    let fieldMap = new Map(Array.from(this.dbSet.fieldMap));
    let eb = new model.GroupExprBuilder<T>(fieldMap);
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

  orderBy(param: types.IArrFieldFunc<model.OrderExprBuilder<T>>) {
    let fieldMap = new Map(Array.from(this.dbSet.fieldMap));
    let eb = new model.OrderExprBuilder<T>(fieldMap);
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

  limit(size: number, index?: number) {
    this.stat.limit = new sql.Expression(null, sql.types.Operator.Limit);
    this.stat.limit.exps.push(new sql.Expression(size.toString()));
    if (index) {
      this.stat.limit.exps.push(new sql.Expression(index.toString()));
    }
    return this;
  }

  async update(entity: T, ...updatedKeys: (keyof T)[]) {
    this.stat.command = sql.types.Command.UPDATE;

    // Dynamic update
    let keys: string[] = Reflect.getMetadata(TABLE_COLUMN_KEYS, entity.constructor.prototype);

    let fields = this.dbSet.filterFields(keys).filter(field => (<(string | symbol)[]>updatedKeys).includes(field.fieldName));
    if (fields.length == 0) throw new Error('Update Fields Empty');

    fields.forEach(field => {
      let c1 = new sql.Expression(field.colName);
      let c2 = new sql.Expression('?');
      let val = Reflect.get(entity, field.fieldName);
      c2.args.push(val);

      let expr = new sql.Expression(null, sql.types.Operator.Equal, c1, c2);
      this.stat.columns.push(expr);
    });

    let result = await this.context.execute(this.stat);
    if (result.error) throw result.error;
  }

  async delete() {
    this.stat.command = sql.types.Command.DELETE;

    let result = await this.context.execute(this.stat);
    if (result.error) throw result.error;
  }

  // join<A extends Object>(coll: IQuerySet<A>, param: types.IJoinFunc<model.WhereExprBuilder<T>, model.GroupExprBuilder<A>>, joinType?: sql.types.Join): IQuerySet<T & A> {
  // 	joinType = joinType ?? sql.types.Join.InnerJoin;

  // 	let temp: sql.Expression | null = null;
  // 	if (param && param instanceof Function) {
  // 		let mainObj = new model.WhereExprBuilder<T>(this.dbSet.fieldMap);
  // 		let joinObj = new model.GroupExprBuilder(coll.) coll.getEntity();
  // 		temp = param(mainObj, joinObj);
  // 	}

  // 	if (!(temp && temp instanceof sql.Expression && temp.exps.length > 0))
  // 		throw new Error('Invalid Join');

  // 	return new JoinQuerySet<T, A>(this, coll, joinType, temp);
  // }
}

export default QuerySet;
