import * as types from '../model/types.js';
import QuerySet from './QuerySet.js'
import OperatorEntity from '../model/OperatorEntity.js';
import Entity from '../model/Entity.js';
import Context from '../Context.js';
import * as sql from '../sql/index.js';

class LinkSet<T extends Entity, U extends Entity> extends QuerySet<T, T>{
	foreignFunc: types.IJoinFunc<OperatorEntity<T>, U> = null;

	constructor(context: Context, entityType: types.IEntityType<T>, foreignFunc: types.IJoinFunc<OperatorEntity<T>, U>) {
		super(context, context.tableSetMap.get(entityType).dbSet, entityType);
		this.foreignFunc = foreignFunc;
	}

	apply(parentObj: U) {
		let expr: sql.Expression = null;
		if (this.foreignFunc && this.foreignFunc instanceof Function) {
			let a = new sql.OperatorEntity<T>();
			expr = this.foreignFunc(a, parentObj);
		}
		if (expr && expr instanceof sql.Expression && expr.exps.length > 0) {
			this.stat.where = this.stat.where.add(expr);
		}
	}

}

export default LinkSet;
