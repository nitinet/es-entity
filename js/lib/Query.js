"use strict";
(function (Operator) {
    Operator[Operator["Equal"] = 1] = "Equal";
    Operator[Operator["NotEqual"] = 2] = "NotEqual";
    Operator[Operator["LessThan"] = 3] = "LessThan";
    Operator[Operator["LessThanEqual"] = 4] = "LessThanEqual";
    Operator[Operator["GreaterThan"] = 5] = "GreaterThan";
    Operator[Operator["GreaterThanEqual"] = 6] = "GreaterThanEqual";
    Operator[Operator["And"] = 7] = "And";
    Operator[Operator["Or"] = 8] = "Or";
    Operator[Operator["Not"] = 9] = "Not";
    Operator[Operator["Between"] = 10] = "Between";
    Operator[Operator["Exists"] = 11] = "Exists";
    Operator[Operator["In"] = 12] = "In";
    Operator[Operator["Like"] = 13] = "Like";
    Operator[Operator["IsNull"] = 14] = "IsNull";
    Operator[Operator["IsNotNull"] = 15] = "IsNotNull";
    Operator[Operator["Asc"] = 16] = "Asc";
    Operator[Operator["Desc"] = 17] = "Desc";
    Operator[Operator["Limit"] = 18] = "Limit";
    Operator[Operator["Comma"] = 19] = "Comma";
})(exports.Operator || (exports.Operator = {}));
var Operator = exports.Operator;
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
    add(...expressions) {
        this.exps = this.exps.concat(expressions);
        return this;
    }
    __logicalAND(operand) {
        let expr = new SqlExpression(null, Operator.And, operand, this);
        return expr;
    }
    __logicalOR(operand) {
        let expr = new SqlExpression(null, Operator.Or, operand, this);
        return expr;
    }
    __unaryNOT() {
        let expr = new SqlExpression(null, Operator.Not, this);
        return expr;
    }
    eval() {
        if (this.value) {
            return this.value;
        }
        else if (this.exps) {
            let values = new Array();
            for (let i = 0; i < this.exps.length; i++) {
                values[i] = this.exps[i].eval();
                this.args = this.args.concat(this.exps[i].args);
            }
            if (!this.operator && this.exps.length > 1) {
                this.operator = Operator.And;
            }
            let val0 = values[0] ? values[0] : "";
            let val1 = values[1] ? values[1] : "";
            let r = "";
            switch (this.operator) {
                case Operator.Equal:
                    r = val0 + " = " + val1;
                    break;
                case Operator.NotEqual:
                    r = val0 + " != " + val1;
                    break;
                case Operator.LessThan:
                    r = val0 + " < " + val1;
                    break;
                case Operator.LessThanEqual:
                    r = val0 + " <= " + val1;
                    break;
                case Operator.GreaterThan:
                    r = val0 + " > " + val1;
                    break;
                case Operator.GreaterThanEqual:
                    r = val0 + " >= " + val1;
                    break;
                case Operator.And:
                    r = "(" + val0;
                    for (let i = 1; i < values.length; i++)
                        r = r + ") and (" + values[i];
                    r = r + ")";
                    break;
                case Operator.Or:
                    r = "(" + val0;
                    for (let i = 1; i < values.length; i++)
                        r = r + ") or (" + values[i];
                    r = r + ")";
                    break;
                case Operator.Not:
                    r = " not " + val0;
                    break;
                case Operator.Between:
                    r = val0 + " between " + val1 + " and " + values[2];
                    break;
                case Operator.Exists:
                    r = " exists (" + val0 + ")";
                    break;
                case Operator.In:
                    r = val0 + " in (" + val1 + ")";
                    break;
                case Operator.Like:
                    r = val0 + " like " + val1;
                    break;
                case Operator.IsNull:
                    r = val0 + " is null";
                    break;
                case Operator.IsNotNull:
                    r = val0 + " is not null";
                    break;
                case Operator.Asc:
                    r = val0 + " asc";
                    break;
                case Operator.Desc:
                    r = val0 + " desc";
                    break;
                case Operator.Limit:
                    {
                        r = "limit " + val0 + (val1 ? "," + val1 : "");
                    }
                    break;
                case Operator.Comma:
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
