"use strict";
class ISqlNode {
    constructor() {
        this.args = new Array();
    }
}
exports.ISqlNode = ISqlNode;
/**
 * SqlStatement
 */
class SqlStatement extends ISqlNode {
    constructor() {
        super();
        this.command = "";
        this.columns = new Array();
        this.values = new Array();
        this.collection = new SqlCollection();
        this.where = new SqlExpression();
        this.groupBy = new Array();
        this.orderBy = new Array();
    }
    eval() {
        let result = "";
        // Column
        let columnStr = "";
        for (let i = 0; i < this.columns.length; i++) {
            let element = this.columns[i];
            let val = element.eval();
            if (i == 0)
                columnStr = columnStr.concat(" " + val);
            else
                columnStr = columnStr.concat(", " + val);
            this.args = this.args.concat(element.args);
        }
        // Collection
        let collectionStr = this.collection.eval();
        this.args = this.args.concat(this.collection.args);
        // Where
        let whereStr = this.where.eval();
        this.args = this.args.concat(this.where.args);
        // Group By
        let groupByStr = "";
        for (let i = 0; i < this.groupBy.length; i++) {
            let element = this.groupBy[i];
            let val = element.eval();
            if (i == 0)
                groupByStr = groupByStr.concat(" " + val);
            else
                groupByStr = groupByStr.concat(", " + val);
            this.args = this.args.concat(element.args);
        }
        // Order By
        let orderByStr = "";
        for (let i = 0; i < this.orderBy.length; i++) {
            let element = this.orderBy[i];
            let val = element.eval();
            if (i == 0)
                orderByStr = orderByStr.concat(" " + val);
            else
                orderByStr = orderByStr.concat(", " + val);
            this.args = this.args.concat(element.args);
        }
        // Values
        let valueStr = "";
        for (let i = 0; i < this.values.length; i++) {
            let element = this.values[i];
            let val = element.eval();
            if (i == 0)
                valueStr = valueStr.concat(" " + val);
            else
                valueStr = valueStr.concat(", " + val);
            this.args = this.args.concat(element.args);
        }
        this.command = this.command.toLowerCase();
        if (this.command === "insert") {
            result = result.concat("insert into ", collectionStr, "(", columnStr, ") values (", valueStr, ")");
        }
        else if (this.command == "select") {
            result = result.concat("select", columnStr, " from ", collectionStr);
            if (whereStr)
                result = result.concat(" where ", whereStr);
            if (groupByStr)
                result = result.concat(" group by ", groupByStr);
            if (orderByStr)
                result = result.concat(" order by ", orderByStr);
        }
        else if (this.command === "update") {
            result = result.concat("update ", collectionStr, " set ", columnStr, " where ", whereStr);
        }
        else if (this.command === "delete") {
            result = result.concat("delete from ", collectionStr, " where ", whereStr);
        }
        return result;
    }
}
exports.SqlStatement = SqlStatement;
/**
 * SqlCollection
 * Used for tables and columns
 */
class SqlCollection extends ISqlNode {
    constructor() {
        super();
        this.value = null;
        this.stat = null;
        this.alias = null;
    }
    eval() {
        let result = "";
        if (!this.value) {
            throw "No Collection Found";
        }
        else if (this.value)
            result = this.value;
        else if (this.stat) {
            this.args = this.args.concat(this.stat.args);
            result = "(" + this.stat.eval() + ")";
        }
        if (this.alias)
            result = result + " as " + this.alias;
        return result;
    }
}
exports.SqlCollection = SqlCollection;
(function (SqlOperator) {
    SqlOperator[SqlOperator["Equal"] = 1] = "Equal";
    SqlOperator[SqlOperator["NotEqual"] = 2] = "NotEqual";
    SqlOperator[SqlOperator["LessThan"] = 3] = "LessThan";
    SqlOperator[SqlOperator["LessThanEqual"] = 4] = "LessThanEqual";
    SqlOperator[SqlOperator["GreaterThan"] = 5] = "GreaterThan";
    SqlOperator[SqlOperator["GreaterThanEqual"] = 6] = "GreaterThanEqual";
    SqlOperator[SqlOperator["And"] = 7] = "And";
    SqlOperator[SqlOperator["Or"] = 8] = "Or";
    SqlOperator[SqlOperator["Not"] = 9] = "Not";
    SqlOperator[SqlOperator["Between"] = 10] = "Between";
    SqlOperator[SqlOperator["Exists"] = 11] = "Exists";
    SqlOperator[SqlOperator["In"] = 12] = "In";
    SqlOperator[SqlOperator["Like"] = 13] = "Like";
    SqlOperator[SqlOperator["IsNull"] = 14] = "IsNull";
    SqlOperator[SqlOperator["IsNotNull"] = 15] = "IsNotNull";
    SqlOperator[SqlOperator["Asc"] = 16] = "Asc";
    SqlOperator[SqlOperator["Desc"] = 17] = "Desc";
    SqlOperator[SqlOperator["Limit"] = 18] = "Limit";
    SqlOperator[SqlOperator["Comma"] = 19] = "Comma";
})(exports.SqlOperator || (exports.SqlOperator = {}));
var SqlOperator = exports.SqlOperator;
/**
 * SqlExpression
 */
class SqlExpression extends ISqlNode {
    constructor(value, operator, ...expressions) {
        super();
        this.value = null;
        this.exps = null;
        this.operator = null;
        this.value = value;
        this.exps = expressions;
        this.operator = operator;
    }
    eval() {
        if (this.value) {
            return this.value;
        }
        else if (this.exps) {
            let values = new Array();
            for (let i = 0; i < this.exps.length; i++) {
                this.args = this.args.concat(this.exps[i].args);
                values[i] = this.exps[i].eval();
            }
            let val0 = values[0] ? values[0] : "";
            let val1 = values[1] ? values[1] : "";
            let r = "";
            switch (this.operator) {
                case SqlOperator.Equal:
                    r = val0 + " = " + val1;
                    break;
                case SqlOperator.NotEqual:
                    r = val0 + " != " + val1;
                    break;
                case SqlOperator.LessThan:
                    r = val0 + " < " + val1;
                    break;
                case SqlOperator.LessThanEqual:
                    r = val0 + " <= " + val1;
                    break;
                case SqlOperator.GreaterThan:
                    r = val0 + " > " + val1;
                    break;
                case SqlOperator.GreaterThanEqual:
                    r = val0 + " >= " + val1;
                    break;
                case SqlOperator.And:
                    r = "(" + val0;
                    for (let i = 1; i < values.length; i++)
                        r = r + ") and (" + values[i];
                    r = r + ")";
                    break;
                case SqlOperator.Or:
                    r = "(" + val0;
                    for (let i = 1; i < values.length; i++)
                        r = r + ") or (" + values[i];
                    r = r + ")";
                    break;
                case SqlOperator.Not:
                    r = " not " + val0;
                    break;
                case SqlOperator.Between:
                    r = val0 + " between " + val1 + " and " + values[2];
                    break;
                case SqlOperator.Exists:
                    r = " exists (" + val0 + ")";
                    break;
                case SqlOperator.In:
                    r = val0 + " in (" + val1 + ")";
                    break;
                case SqlOperator.Like:
                    r = val0 + " like " + val1;
                    break;
                case SqlOperator.IsNull:
                    r = val0 + " is null";
                    break;
                case SqlOperator.IsNotNull:
                    r = val0 + " is not null";
                    break;
                case SqlOperator.Asc:
                    r = val0 + " asc";
                    break;
                case SqlOperator.Desc:
                    r = val0 + " desc";
                    break;
                case SqlOperator.Limit:
                    {
                        r = "limit " + val0 + (val1 ? "," + val1 : "");
                    }
                    break;
                case SqlOperator.Comma:
                    {
                        for (let i = 0; i < values.length; i++)
                            r = r.concat(r, values[i], ", ");
                        r = r.slice(0, r.length - 2);
                    }
                    break;
                default:
                    break;
            }
            return r;
        }
    }
}
exports.SqlExpression = SqlExpression;
