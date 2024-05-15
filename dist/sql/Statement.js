import Collection from './Collection.js';
import Expression from './Expression.js';
import INode from './INode.js';
import Command from './types/Command.js';
class Statement extends INode {
    command = null;
    columns = new Array();
    values = new Array();
    collection = new Collection();
    where = new Expression();
    groupBy = new Array();
    orderBy = new Array();
    limit = new Expression();
    eval(handler) {
        let result;
        switch (this.command) {
            case Command.SELECT:
                result = this.selectQuery(handler);
                break;
            case Command.INSERT:
                result = this.insertQuery(handler);
                break;
            case Command.UPDATE:
                result = this.updateQuery(handler);
                break;
            case Command.DELETE:
                result = this.deleteQuery(handler);
                break;
            default:
                throw new Error('Invalid Statement');
        }
        return result;
    }
    insertQuery(handler) {
        let collectionStr = this.getCollectionStr(handler);
        let columnStr = this.getColumnStr(handler);
        let valueStr = this.getValueStr(handler);
        return `insert into ${collectionStr} (${columnStr}) values (${valueStr})`;
    }
    selectQuery(handler) {
        let collectionStr = this.getCollectionStr(handler);
        let columnStr = this.getColumnStr(handler);
        let whereStr = this.getWhereStr(handler);
        let groupByStr = this.getGroupByStr(handler);
        let orderByStr = this.getOrderByStr(handler);
        let limitStr = this.getLimitStr(handler);
        return `select ${columnStr} from ${collectionStr}${whereStr}${groupByStr}${orderByStr}${limitStr}`;
    }
    updateQuery(handler) {
        let collectionStr = this.getCollectionStr(handler);
        let columnStr = this.getColumnStr(handler);
        let whereStr = this.getWhereStr(handler);
        return `update ${collectionStr} set ${columnStr}${whereStr}`;
    }
    deleteQuery(handler) {
        let collectionStr = this.getCollectionStr(handler);
        let whereStr = this.getWhereStr(handler);
        return `delete from ${collectionStr}${whereStr}`;
    }
    getCollectionStr(handler) {
        let collectionStr = this.collection.eval(handler);
        this.args = this.args.concat(this.collection.args);
        return collectionStr;
    }
    getColumnStr(handler) {
        return this.columns
            .map(ele => {
            let r = ele.eval(handler);
            this.args = this.args.concat(ele.args);
            return r;
        }, this)
            .join(', ');
    }
    getWhereStr(handler) {
        let whereStr = this.where.eval(handler);
        this.args = this.args.concat(this.where.args);
        return whereStr ? ` where ${whereStr}` : '';
    }
    getValueStr(handler) {
        return this.values
            .map(ele => {
            let r = ele.eval(handler);
            this.args = this.args.concat(ele.args);
            return r;
        }, this)
            .join(', ');
    }
    getGroupByStr(handler) {
        let groupByStr = this.groupBy
            .map(ele => {
            let r = ele.eval(handler);
            this.args = this.args.concat(ele.args);
            return r;
        }, this)
            .join(', ');
        return groupByStr ? ` group by ${groupByStr}` : '';
    }
    getOrderByStr(handler) {
        let orderByStr = this.orderBy
            .map(ele => {
            let r = ele.eval(handler);
            this.args = this.args.concat(ele.args);
            return r;
        }, this)
            .join(', ');
        return orderByStr ? ` order by ${orderByStr}` : '';
    }
    getLimitStr(handler) {
        let limitStr = this.limit.eval(handler);
        this.args = this.args.concat(this.limit.args);
        return limitStr;
    }
}
export default Statement;
//# sourceMappingURL=Statement.js.map