import QuerySet from './QuerySet.js';
class LinkSet extends QuerySet {
    entityType;
    foreignFunc = null;
    constructor(entityType, foreignFunc) {
        super();
        this.entityType = entityType;
        this.foreignFunc = foreignFunc;
    }
    apply(parentObj) {
        let a = this.getEntity();
        this.where(this.foreignFunc);
    }
}
export default LinkSet;
