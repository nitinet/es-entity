import * as types from '../model/types.js';
import * as model from '../model/index.js';
import * as sql from '../sql/index.js';
import QuerySet from './QuerySet.js'
import WhereExprBuilder from '../model/WhereExprBuilder.js';
import Context from '../Context.js';

class LinkSet<T extends Object, U extends Object> extends QuerySet<T, T>{
	private foreignFunc: types.IJoinFunc<WhereExprBuilder<T>, U>;

	constructor(context: Context, entityType: types.IEntityType<T>, foreignFunc: types.IJoinFunc<WhereExprBuilder<T>, U>) {
		super(context, context.tableSetMap.get(entityType), entityType);
		this.foreignFunc = foreignFunc;
	}

	apply(parentObj: U) {
		let expr: sql.Expression | null = null;
		if (this.foreignFunc && this.foreignFunc instanceof Function) {
			let eb = new model.WhereExprBuilder<T>(this.dbSet.fieldMap);
			expr = this.foreignFunc(eb, parentObj);
		}
		if (expr && expr instanceof sql.Expression && expr.exps.length > 0) {
			this.stat.where = this.stat.where.add(expr);
		}
	}

}

export default LinkSet;
