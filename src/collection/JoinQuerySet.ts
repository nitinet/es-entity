import Context from '../Context.js';
import * as bean from '../bean/index.js';
import * as model from '../model/index.js';
import * as types from '../model/types.js';
import * as sql from '../sql/index.js';
import DBSet from './DBSet.js';
import IQuerySet from './IQuerySet.js';
import SelectQuerySet from './SelectQuerySet.js';

class JoinQuerySet<T extends Object, U extends Object, V extends T & U> extends IQuerySet<V> {

	private mainSet: IQuerySet<T>;
	private joinSet: IQuerySet<U>;

	stat: sql.Statement = new sql.Statement();

	constructor(context: Context, EntityType: types.IEntityType<V>, mainSet: IQuerySet<T>, joinSet: IQuerySet<U>, joinType: sql.types.Join, expr: sql.Expression) {
		super();
		this.context = context;
		this.EntityType = EntityType;

		this.mainSet = mainSet;
		this.joinSet = joinSet;

		let entries = [...Array.from(this.mainSet.dbSet.fieldMap.entries()), ...Array.from(this.joinSet.dbSet.fieldMap.entries())];
		this.dbSet.fieldMap = new Map(entries);

		this.stat = new sql.Statement();

		// this.stat.collection.leftColl = this.mainSet.stat.collection;
		// this.stat.collection.rightColl = this.joinSet.stat.collection;
		this.stat.collection.join = joinType;

		this.stat.where = this.stat.where.add(expr);
	}

	// Selection Functions
	async list(): Promise<V[]> {
		this.stat.command = sql.types.Command.SELECT;

		// Get all Columns
		let temp = new this.EntityType();
		let targetKeys = <string[]>Reflect.ownKeys(temp);
		let fields = this.dbSet.filterFields(targetKeys);
		this.stat.columns = this.getColumnExprs(fields);

		let result = await this.context.execute(this.stat);
		return this.mapData(result);
	}

	async listPlain(keys: (keyof V)[]): Promise<Partial<V>[]> {
		this.stat.command = sql.types.Command.SELECT;

		let fields = this.dbSet.filterFields(<string[]>keys);
		this.stat.columns = this.getColumnExprs(fields);

		let input = await this.context.execute(this.stat);
		let data = input.rows.map(row => {
			let obj: Partial<V> = {};
			fields.forEach(field => {
				let colName = field.colName;
				let val = row[colName] ?? row[colName.toLowerCase()] ?? row[colName.toUpperCase()];
				Reflect.set(obj, field.fieldName, val);
			});
			return obj;
		});
		return data;
	}

	async mapData(input: bean.ResultSet): Promise<V[]> {
		let temp = new this.EntityType();
		let keys = <string[]>Reflect.ownKeys(temp);

		let data = input.rows.map(row => {
			let obj = new this.EntityType();
			keys.forEach(key => {
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
		});
		return data;
	}

	select<W extends Object>(EntityType: types.IEntityType<W>): IQuerySet<W> {
		let keys = Reflect.ownKeys(new this.EntityType());
		let cols = Array.from(this.dbSet.fieldMap.entries()).filter(a => keys.includes(a[0]));

		let newDbSet = new DBSet();
		newDbSet.fieldMap = new Map(cols);

		let res = new SelectQuerySet(this.context, EntityType, newDbSet);
		return res;
	}

	// Conditional Functions
	where(param: types.IWhereFunc<model.WhereExprBuilder<V>>, ...args: any[]) {
		let fieldMap = new Map(Array.from(this.dbSet.fieldMap));
		let eb = new model.WhereExprBuilder<V>(fieldMap);
		let res = param(eb, args);
		if (res && res instanceof sql.Expression && res.exps.length > 0) {
			this.stat.where = this.stat.where.add(res);
		}
		return this;
	}

	groupBy(param: types.IArrFieldFunc<model.GroupExprBuilder<V>>) {
		let fieldMap = new Map(Array.from(this.dbSet.fieldMap));
		let eb = new model.GroupExprBuilder<V>(fieldMap);
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

	orderBy(param: types.IArrFieldFunc<model.OrderExprBuilder<V>>) {
		let fieldMap = new Map(Array.from(this.dbSet.fieldMap));
		let eb = new model.OrderExprBuilder<V>(fieldMap);
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

	// join<A extends Object>(coll: IQuerySet<A>, param: types.IJoinFunc<model.WhereExprBuilder<V>, model.GroupExprBuilder<A>>, joinType?: sql.types.Join): IQuerySet<V & A> {
	// 	joinType = joinType || sql.types.Join.InnerJoin;

	// 	let temp: sql.Expression | null = null;
	// 	if (param && param instanceof Function) {
	// 		let mainObj = this.getEntity(); new model.WhereExprBuilder<T>(this.dbSet.fieldMap);
	// 		let joinObj = coll.getEntity();
	// 		temp = param(mainObj, joinObj);
	// 	}
	// 	let res: JoinQuerySet<V, A>;
	// 	if (temp instanceof sql.Expression && temp.exps.length > 0) {
	// 		res = new JoinQuerySet<V, A>(this, coll, joinType, temp);
	// 	} else {
	// 		throw new TypeError('Invalid Join');
	// 	}
	// 	return res;
	// }

}

export default JoinQuerySet;
