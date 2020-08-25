import * as types from '../types';
import QuerySet from './QuerySet'
import * as funcs from './funcs';

class LinkSet<T extends Object> extends QuerySet<T>{
	entityType: types.IEntityType<T>;
	foreignFunc: funcs.IJoinFunc<T, any> = null;

	constructor(entityType: types.IEntityType<T>, foreignFunc: funcs.IJoinFunc<T, any>) {
		super();
		this.entityType = entityType;
		this.foreignFunc = foreignFunc;
	}

	apply(parentObj) {
		let a = this.getEntity();
		let expr = this.foreignFunc(a, parentObj);
		this.where(expr);
	}

}

export default LinkSet;
