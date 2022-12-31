import LinkSet from '../collection/LinkSet.js';
import * as types from './types.js';
import Context from '../Context.js';
import OperatorEntity from './OperatorEntity.js';
import Entity from './Entity.js';

class LinkArray<T extends Entity, U extends Entity> {
	private EntityType: types.IEntityType<T> = null;
	private foreignFunc: types.IJoinFunc<OperatorEntity<T>, U> = null;

	private linkSet: LinkSet<T, U> = null;
	private _value: T[] = null;

	constructor(EntityType: types.IEntityType<T>, foreignFunc: types.IJoinFunc<OperatorEntity<T>, U>) {
		this.EntityType = EntityType;
		this.foreignFunc = foreignFunc;
	}

	bind(context: Context) {
		this.linkSet = new LinkSet<T, U>(context, this.EntityType, this.foreignFunc);
	}

	async apply(parentObj: U) {
		this.linkSet.apply(parentObj);
	}

	async get() {
		if (!this._value) this._value = await this.linkSet.list();
		return this._value;
	}

	toJSON() {
		if (this._value != null) {
			return this._value.valueOf();
		} else {
			return null;
		}
	}

}

export default LinkArray;
