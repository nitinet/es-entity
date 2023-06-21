import * as types from '../model/types.js';
import * as model from '../model/index.js';
import QuerySet from './QuerySet.js'
import WhereExprBuilder from '../model/WhereExprBuilder.js';
import Context from '../Context.js';

class LinkSet<T extends Object, U extends Object> extends QuerySet<T>{
	private foreignFunc: types.IJoinFunc<WhereExprBuilder<T>, U>;

	constructor(context: Context, entityType: types.IEntityType<T>, foreignFunc: types.IJoinFunc<WhereExprBuilder<T>, U>) {
		super(context, context.tableSetMap.get(entityType));
		this.foreignFunc = foreignFunc;
	}

	apply(parentObj: U) {
		let eb = new model.WhereExprBuilder<T>(this.dbSet.fieldMap);
		let expr = this.foreignFunc(eb, parentObj);

		if (expr && expr.exps.length > 0) {
			this.stat.where = this.stat.where.add(expr);
		}
	}

}

export default LinkSet;
