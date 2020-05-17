import INode from './INode';
class Collection extends INode {
    constructor() {
        super();
        this.colAlias = null;
        this.value = null;
        this.stat = null;
        this.alias = null;
    }
    eval(handler) {
        let result = '';
        if (this.value) {
            result = this.colAlias ? this.colAlias + '.' + this.value : this.value;
        }
        else if (this.stat) {
            this.args = this.args.concat(this.stat.args);
            result = '(' + this.stat.eval(handler) + ')';
        }
        if (!result) {
            throw 'No Collection Found';
        }
        if (this.alias) {
            result = result.concat(' as ', this.alias);
        }
        return result;
    }
}
export default Collection;
//# sourceMappingURL=Collection.js.map