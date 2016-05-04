"use strict";
/**
 * SqlStatement
 */
class SqlStatement {
    constructor() {
        this.command = "";
        this.columns = new Array();
        this.values = new Array();
        this.collection = new SqlCollection();
        this.where = new SqlExpression();
        this.groupBy = new Array();
        this.orderBy = new Array();
    }
    eval() {
        let p = new Promise((resolve) => {
            let result = "";
            let promises = new Array();
            // Column Promises
            let columnStrArr = new Array();
            for (let i = 0; i < this.columns.length; i++) {
                let element = this.columns[i];
                let p1 = element.eval().then((val) => {
                    columnStrArr[i] = val;
                });
                promises.push(p1);
            }
            // Collection Promise
            let collectionStr = "";
            let p2 = this.collection.eval().then((val) => {
                collectionStr = val;
            });
            promises.push(p2);
            // Where promise
            let whereStr = "";
            let p3 = this.where.eval().then((val) => {
                whereStr = val;
            });
            promises.push(p3);
            // Group By Promises
            let groupByStrArr = new Array();
            for (let i = 0; i < this.groupBy.length; i++) {
                let element = this.groupBy[i];
                let p4 = element.eval().then((val) => {
                    groupByStrArr[i] = val;
                });
                promises.push(p4);
            }
            // Order By Promises
            let orderByStrArr = new Array();
            for (let i = 0; i < this.orderBy.length; i++) {
                let element = this.orderBy[i];
                let p5 = element.eval().then((val) => {
                    orderByStrArr[i] = val;
                });
                promises.push(p5);
            }
            // Column Promises
            let valueStrArr = new Array();
            for (let i = 0; i < this.values.length; i++) {
                let element = this.values[i];
                let p6 = element.eval().then((val) => {
                    valueStrArr[i] = val;
                });
                promises.push(p6);
            }
            Promise.all(promises).then(() => {
                let columnStr = "";
                for (let i = 0; i < columnStrArr.length; i++) {
                    let element = columnStrArr[i];
                    if (i == 0)
                        columnStr.concat(" " + element);
                    else
                        columnStr.concat(", " + element);
                }
                let groupByStr = "";
                for (let i = 0; i < groupByStrArr.length; i++) {
                    let element = groupByStrArr[i];
                    if (i == 0)
                        groupByStr.concat(" " + element);
                    else
                        groupByStr.concat(", " + element);
                }
                let orderByStr = "";
                for (let i = 0; i < orderByStrArr.length; i++) {
                    let element = orderByStrArr[i];
                    if (i == 0)
                        orderByStr.concat(" " + element);
                    else
                        orderByStr.concat(", " + element);
                }
                let valueStr = "";
                for (let i = 0; i < valueStrArr.length; i++) {
                    let element = valueStrArr[i];
                    if (i == 0)
                        valueStr.concat(" " + element);
                    else
                        valueStr.concat(", " + element);
                }
                this.command = this.command.toLowerCase();
                if (this.command === "insert") {
                    result.concat("insert into ", collectionStr, "(", columnStr, ") values (", valueStr, ")");
                }
                else if (this.command == "select") {
                    result.concat("select", columnStr, " from ", collectionStr, " where ", whereStr, " group by ", groupByStr, " order by ", orderByStr);
                }
                else if (this.command === "update") {
                    result.concat("update ", collectionStr, " set ", columnStr, " where ", whereStr);
                }
                else if (this.command === "delete") {
                    result.concat("delete from ", collectionStr, " where ", whereStr);
                }
                resolve(result);
            });
        });
        return p;
    }
}
exports.SqlStatement = SqlStatement;
/**
 * SqlCollection
 * Used for tables and columns
 */
class SqlCollection {
    constructor() {
        this.value = null;
        this.stat = null;
        this.alias = null;
    }
    eval() {
        let p = new Promise((resolve, reject) => {
            if (!this.value) {
                reject();
            }
            else if (this.value)
                resolve(this.value);
            else if (this.stat) {
                resolve("(" + this.stat.eval() + ")");
            }
        }).then((val) => {
            if (this.alias)
                val = val + " as " + this.alias;
            return val;
        });
        return p;
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
class SqlExpression {
    constructor(value, operator, ...expressions) {
        this.value = null;
        this.exps = null;
        this.operator = null;
        this.value = value;
        this.exps = expressions;
        this.operator = operator;
    }
    eval() {
        let p = new Promise((resolve) => {
            if (this.value) {
                resolve(this.value);
            }
            else if (this.exps) {
                let promises = new Array();
                let temp = this.exps;
                for (let i = 0; i < temp.length; i++) {
                    let p = new Promise((res) => {
                        if (!temp[i]) {
                            res();
                        }
                        else if (typeof temp[i] === "string")
                            res(temp[i]);
                        else if (temp[i] instanceof SqlExpression) {
                            res(temp[i].eval());
                        }
                    });
                    promises.push(p);
                }
                Promise.all(promises).then((values) => {
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
                                    r.concat(r, values[i], ", ");
                                r = r.slice(0, r.length - 2);
                            }
                            break;
                        default:
                            break;
                    }
                    resolve(r);
                });
            }
        });
        return p;
    }
}
exports.SqlExpression = SqlExpression;
