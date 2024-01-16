import LinkSet from '../collection/LinkSet.js';
class LinkObject {
    EntityType;
    foreignFunc;
    linkSet = null;
    _value = null;
    constructor(EntityType, foreignFunc) {
        this.EntityType = EntityType;
        this.foreignFunc = foreignFunc;
    }
    bind(context, parentObj) {
        this.linkSet = new LinkSet(context, this.EntityType, this.foreignFunc);
        this.linkSet.apply(parentObj);
    }
    async get() {
        if (!this.linkSet)
            throw new TypeError('Entity Not Bonded');
        if (!this._value)
            this._value = await this.linkSet.single();
        return this._value;
    }
    toJSON() {
        return this._value?.valueOf() ?? null;
    }
}
export default LinkObject;
//# sourceMappingURL=LinkObject.js.map