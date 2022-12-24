import LinkSet from '../collection/LinkSet.js';
class LinkObjectType {
    linkSet = null;
    applied = false;
    _value = null;
    constructor(entityType, foreignFunc) {
        this.linkSet = new LinkSet(entityType, foreignFunc);
    }
    bind(context) {
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
        }
        else {
            return null;
        }
    }
}
export default LinkObjectType;
