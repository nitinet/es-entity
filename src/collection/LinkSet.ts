import Context from '../Context.js';
import WhereExprBuilder from '../model/WhereExprBuilder.js';
import * as model from '../model/index.js';
import * as types from '../model/types.js';
import DBSet from './DBSet.js';
import QuerySet from './QuerySet.js';

class LinkSet<T extends Object, U extends Object> extends QuerySet<T>{
	private foreignFunc: types.IJoinFunc<WhereExprBuilder<T>, U>;

	constructor(context: Context, entityType: types.IEntityType<T>, dbSet: DBSet, foreignFunc: types.IJoinFunc<WhereExprBuilder<T>, U>) {
		super(context, entityType, dbSet);
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
