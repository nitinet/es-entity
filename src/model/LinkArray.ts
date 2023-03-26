import LinkSet from '../collection/LinkSet.js';
import * as types from './types.js';
import Context from '../Context.js';
import WhereExprBuilder from './WhereExprBuilder.js';

class LinkArray<T extends Object, U extends Object> {
	private EntityType: types.IEntityType<T>;
	private foreignFunc: types.IJoinFunc<WhereExprBuilder<T>, U>;

	private linkSet: LinkSet<T, U> | null = null;
	private _value: T[] | null = null;

	constructor(EntityType: types.IEntityType<T>, foreignFunc: types.IJoinFunc<WhereExprBuilder<T>, U>) {
		this.EntityType = EntityType;
		this.foreignFunc = foreignFunc;
	}

	bind(context: Context, parentObj: U) {
		this.linkSet = new LinkSet<T, U>(context, this.EntityType, this.foreignFunc);
		this.linkSet.apply(parentObj);
	}

	async get() {
		if (!this.linkSet) throw new TypeError('Entity Not Bonded');
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
