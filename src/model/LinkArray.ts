import IEntityType from '../types/IEntityType.js';
import LinkSet from '../collection/LinkSet.js';
import * as funcs from '../types/index.js';
import Context from '../Context.js';
import OperatorEntity from './OperatorEntity.js';

class LinkArray<T> {
	private linkSet: LinkSet<T> = null;
	private applied: boolean = false;
	private _value: T[] = null;

	constructor(entityType: IEntityType<T>, foreignFunc: funcs.IJoinFunc<OperatorEntity<T>, any>) {
		this.linkSet = new LinkSet<T>(entityType, foreignFunc);
	}

	bind(context: Context) {
		this.linkSet.context = context;
		let dbSet = context.dbSetMap.get(this.linkSet.entityType);
		this.linkSet.bind(dbSet);
	}

	async apply(parentObj: any) {
		this.linkSet.apply(parentObj);
	}

	async get() {
		if (!this.applied) {
			this._value = await this.linkSet.list();
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

export default LinkArray;
