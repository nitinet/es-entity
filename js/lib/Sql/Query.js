"use strict";
/**
 * SqlStatement
 */
class SqlStatement {
    constructor() {
        this._command = "";
        this._columns = new Array();
        this._collection = new SqlCollection();
        this._where = new SqlExpression();
        this._groupBy = new Array();
        this._orderBy = new Array();
    }
    get command() {
        return this._command;
    }
    set command(val) {
        this._command = val;
    }
    get columns() {
        return this._columns;
    }
    set columns(val) {
        this._columns = val;
    }
    get collection() {
        return this._collection;
    }
    set collection(val) {
        this._collection = val;
    }
    get where() {
        return this._where;
    }
    set where(val) {
        this._where = val;
    }
    get groupBy() {
        return this._groupBy;
    }
    set groupBy(val) {
        this._groupBy = val;
    }
    get orderBy() {
        return this._orderBy;
    }
    set orderBy(val) {
        this._orderBy = val;
    }
    eval() {
        let p = new Promise((resolve) => {
            let result = "";
            let promises = new Array();
            // Column Promises
            let columnStrArr = new Array();
            for (let i = 0; i < this._columns.length; i++) {
                let element = this._columns[i];
                let p1 = element.eval();
                p1.then((val) => {
                    columnStrArr[i] = val;
                });
                promises.push(p1);
            }
            // Collection Promise
            let collectionStr = "";
            let p2 = this._collection.eval();
            p2.then((val) => {
                collectionStr = val;
            });
            promises.push(p2);
            // Where promise
            let whereStr = "";
            let p3 = this._where.eval();
            p3.then((val) => {
                whereStr = val;
            });
            promises.push(p3);
            // Group By Promises
            let groupByStrArr = new Array();
            for (let i = 0; i < this._groupBy.length; i++) {
                let element = this._groupBy[i];
                let p4 = element.eval();
                p4.then((val) => {
                    groupByStrArr[i] = val;
                });
                promises.push(p4);
            }
            // Order By Promises
            let orderByStrArr = new Array();
            for (let i = 0; i < this._orderBy.length; i++) {
                let element = this._orderBy[i];
                let p5 = element.eval();
                p5.then((val) => {
                    orderByStrArr[i] = val;
                });
                promises.push(p5);
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
                this._command = this._command.toLowerCase();
                if (this._command === "insert") {
                    result.concat("insert into ", collectionStr, " values (", columnStr, ")");
                }
                else if (this._command == "select") {
                    result.concat("select", columnStr, " from ", collectionStr, " where ", whereStr, " group by ", groupByStr, " order by ", orderByStr);
                }
                else if (this._command === "update") {
                    result.concat("update ", collectionStr, " set ", columnStr, " where ", whereStr);
                }
                else if (this._command === "delete") {
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
        this._value = null;
        this._alias = null;
    }
    get value() {
        return this._value;
    }
    set value(val) {
        this._value = val;
    }
    get alias() {
        return this._alias;
    }
    set alias(val) {
        this._alias = val;
    }
    eval() {
        let p = new Promise((resolve, reject) => {
            if (!this._value) {
                reject();
            }
            else if (typeof this._value === "string")
                resolve(this._value);
            else if ((this._value instanceof SqlStatement) || (this._value instanceof SqlExpression)) {
                resolve("(" + this._value.eval() + ")");
            }
        }).then((val) => {
            if (this._alias)
                val = val + " as " + this._alias;
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
})(exports.SqlOperator || (exports.SqlOperator = {}));
var SqlOperator = exports.SqlOperator;
/**
 * SqlExpression
 */
class SqlExpression {
    constructor(operator, ...expressions) {
        this._exps = null;
        this._operator = null;
        this._exps = expressions;
        this._operator = operator;
    }
    get exps() {
        return this._exps;
    }
    set exps(val) {
        this._exps = val;
    }
    get operator() {
        return this._operator;
    }
    set operator(val) {
        this._operator = val;
    }
    eval() {
        let p = new Promise((resolve) => {
            if (!this._exps) {
                resolve();
            }
            else if (typeof this._exps === "string")
                resolve(this._exps);
            else if (this._exps instanceof SqlExpression) {
                resolve(this._exps.eval());
            }
            else if (Array.isArray(this._exps)) {
                let promises = new Array();
                let temp = this._exps;
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
                    switch (this._operator) {
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
                            {
                                r = val0 + " in [";
                                for (let i = 1; i < values.length; i++)
                                    r = r + values[i] + ", ";
                                r = r.slice(0, r.length - 2) + "]";
                            }
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
