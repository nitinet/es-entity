"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const INode_1 = require("./INode");
const Expression_1 = require("./Expression");
const Collection_1 = require("./Collection");
class Statement extends INode_1.default {
    constructor() {
        super();
        this.command = '';
        this.columns = new Array();
        this.values = new Array();
        this.collection = new Collection_1.default();
        this.where = new Expression_1.default();
        this.groupBy = new Array();
        this.orderBy = new Array();
        this.limit = new Expression_1.default();
    }
    eval(handler) {
        if (!handler) {
            throw 'No Handler Found';
        }
        let result = '';
        let columnStr = '';
        for (let i = 0; i < this.columns.length; i++) {
            let element = this.columns[i];
            let val = element.eval(handler);
            if (i == 0) {
                columnStr = columnStr.concat(' ' + val);
            }
            else {
                columnStr = columnStr.concat(', ' + val);
            }
            this.args = this.args.concat(element.args);
        }
        let collectionStr = this.collection.eval(handler);
        this.args = this.args.concat(this.collection.args);
        let whereStr = this.where.eval(handler);
        this.args = this.args.concat(this.where.args);
        let groupByStr = '';
        for (let i = 0; i < this.groupBy.length; i++) {
            let element = this.groupBy[i];
            let val = element.eval(handler);
            if (i == 0) {
                groupByStr = groupByStr.concat(' ' + val);
            }
            else {
                groupByStr = groupByStr.concat(', ' + val);
            }
            this.args = this.args.concat(element.args);
        }
        let orderByStr = '';
        for (let i = 0; i < this.orderBy.length; i++) {
            let element = this.orderBy[i];
            let val = element.eval(handler);
            if (i == 0) {
                orderByStr = orderByStr.concat(' ' + val);
            }
            else {
                orderByStr = orderByStr.concat(', ' + val);
            }
            this.args = this.args.concat(element.args);
        }
        let limitStr = this.limit.eval(handler);
        this.args = this.args.concat(this.limit.args);
        let valueStr = '';
        for (let i = 0; i < this.values.length; i++) {
            let element = this.values[i];
            let val = element.eval(handler);
            if (i == 0) {
                valueStr = valueStr.concat(' ' + val);
            }
            else {
                valueStr = valueStr.concat(', ' + val);
            }
            this.args = this.args.concat(element.args);
        }
        this.command = this.command.toLowerCase();
        if (this.command === 'insert') {
            result = result.concat(handler.insertQuery(collectionStr, columnStr, valueStr));
        }
        else if (this.command == 'select') {
            result = result.concat(handler.selectQuery(collectionStr, columnStr));
            if (whereStr) {
                result = result.concat(handler.whereQuery(whereStr));
            }
            if (groupByStr) {
                result = result.concat(handler.groupQuery(groupByStr));
            }
            if (orderByStr) {
                result = result.concat(handler.orderQuery(orderByStr));
            }
            if (limitStr) {
                result = result.concat(limitStr);
            }
        }
        else if (this.command === 'update') {
            result = result.concat(handler.updateQuery(collectionStr, columnStr, whereStr));
        }
        else if (this.command === 'delete') {
            result = result.concat(handler.deleteQuery(collectionStr, whereStr));
        }
        result = handler.convertPlaceHolder(result);
        return result;
    }
}
exports.default = Statement;
//# sourceMappingURL=Statement.js.map