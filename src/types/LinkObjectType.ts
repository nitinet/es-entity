import IEntityType from './IEntityType';
import LinkSet from '../collection/LinkSet';
import * as funcs from '../collection/funcs';
import Context from '../Context';

class LinkObjectType<T extends Object> {
	private linkSet: LinkSet<T> = null;
	private applied: boolean = false;
	private _value: T = null;

	constructor(entityType: IEntityType<T>, foreignFunc: funcs.IJoinFunc<T, any>) {
		this.linkSet = new LinkSet<T>(entityType, foreignFunc);

		return new Proxy(this, {
			get(target, prop) {
				if (prop in target) {
					return target[prop];
				} else if (target._value) {
					return target._value[prop];
				}
			},
			getPrototypeOf() {
				return LinkObjectType.prototype;
			}
		});
	}

	bind(context: Context) {
		this.linkSet.context = context;
		let dbSet = context.dbSetMap.get(this.linkSet.entityType);
		this.linkSet.bind(dbSet);
	}

	async apply(parentObj) {
		this.linkSet.apply(parentObj);
	}

	async get() {
		if (!this.applied) {
			this._value = await this.linkSet.unique();
			this.applied = true;
		}
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

export default LinkObjectType;
