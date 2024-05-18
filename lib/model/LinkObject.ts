import Context from '../Context.js';
import LinkSet from '../collection/LinkSet.js';
import WhereExprBuilder from './WhereExprBuilder.js';
import * as types from './types.js';

class LinkObject<T extends Object, U extends Object> {
  private EntityType: types.IEntityType<T>;
  private foreignFunc: types.IJoinFunc<WhereExprBuilder<T>, U>;

  private linkSet: LinkSet<T, U> | null = null;
  private _value: T | null = null;

  constructor(EntityType: types.IEntityType<T>, foreignFunc: types.IJoinFunc<WhereExprBuilder<T>, U>) {
    this.EntityType = EntityType;
    this.foreignFunc = foreignFunc;
  }

  bind(context: Context, parentObj: U) {
    let tableSet = context.tableSetMap.get(this.EntityType);
    if (!tableSet) throw TypeError('Invalid Type');

    this.linkSet = new LinkSet<T, U>(context, this.EntityType, tableSet.dbSet, this.foreignFunc);
    this.linkSet.apply(parentObj);
  }

  async get() {
    if (!this.linkSet) throw new TypeError('Entity Not Bonded');
    if (!this._value) this._value = await this.linkSet.single();
    return this._value;
  }

  toJSON() {
    return this._value?.valueOf() ?? null;
  }
}

export default LinkObject;
