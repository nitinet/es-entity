import LinkSet from '../collection/LinkSet.js';
class LinkArray {
    EntityType;
    foreignFunc;
    linkSet = null;
    _value = null;
    constructor(EntityType, foreignFunc) {
        this.EntityType = EntityType;
        this.foreignFunc = foreignFunc;
    }
    bind(context, parentObj) {
        let tableSet = context.tableSetMap.get(this.EntityType);
        if (!tableSet)
            throw TypeError('Invalid Type');
        this.linkSet = new LinkSet(context, this.EntityType, tableSet.dbSet, this.foreignFunc);
        this.linkSet.apply(parentObj);
    }
    async get() {
        if (!this.linkSet)
            throw new TypeError('Entity Not Bonded');
        if (!this._value)
            this._value = await this.linkSet.list();
        return this._value;
    }
    toJSON() {
        return this._value?.valueOf() ?? null;
    }
}
export default LinkArray;
//# sourceMappingURL=LinkArray.js.map