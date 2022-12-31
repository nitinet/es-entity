import * as types from '../types/index.js';
import QuerySet from './QuerySet.js'
import OperatorEntity from '../model/OperatorEntity.js';
import Entity from '../model/Entity.js';

class LinkSet<T extends Entity> extends QuerySet<T>{
	entityType: types.IEntityType<T>;
	foreignFunc: types.IJoinFunc<OperatorEntity<T>, any> = null;

	constructor(entityType: types.IEntityType<T>, foreignFunc: types.IJoinFunc<OperatorEntity<T>, any>) {
		super();
		this.entityType = entityType;
		this.foreignFunc = foreignFunc;
	}

	apply(parentObj: any) {
		let a = this.getEntity();
		this.where(this.foreignFunc);
	}

}

export default LinkSet;
