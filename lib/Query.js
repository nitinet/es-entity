"use strict";
class ISqlNode {
    constructor() {
        this.args = new Array();
    }
}
exports.ISqlNode = ISqlNode;
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
        this.limit = new SqlExpression();
    }
    eval() {
        let result = "";
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
        let collectionStr = this.collection.eval();
        this.args = this.args.concat(this.collection.args);
        let whereStr = this.where.eval();
        this.args = this.args.concat(this.where.args);
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
        let limitStr = this.limit.eval();
        this.args = this.args.concat(this.limit.args);
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
            if (limitStr)
                result = result.concat(limitStr);
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
class SqlCollection extends ISqlNode {
    constructor() {
        super();
        this.colAlias = null;
        this.value = null;
        this.stat = null;
        this.alias = null;
    }
    eval() {
        let result = "";
        if (this.value)
            result = this.colAlias ? this.colAlias + "." + this.value : this.value;
        else if (this.stat) {
            this.args = this.args.concat(this.stat.args);
            result = "(" + this.stat.eval() + ")";
        }
        if (!result) {
            throw "No Collection Found";
        }
        if (this.alias)
            result = result.concat(" as ", this.alias);
        return result;
    }
}
exports.SqlCollection = SqlCollection;
class Column {
    constructor() {
        this._alias = "";
        this._name = "";
        this._updated = false;
    }
}
exports.Column = Column;
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
    Operator[Operator["Plus"] = 10] = "Plus";
    Operator[Operator["Minus"] = 11] = "Minus";
    Operator[Operator["Multiply"] = 12] = "Multiply";
    Operator[Operator["Devide"] = 13] = "Devide";
    Operator[Operator["Between"] = 14] = "Between";
    Operator[Operator["Exists"] = 15] = "Exists";
    Operator[Operator["In"] = 16] = "In";
    Operator[Operator["Like"] = 17] = "Like";
    Operator[Operator["IsNull"] = 18] = "IsNull";
    Operator[Operator["IsNotNull"] = 19] = "IsNotNull";
    Operator[Operator["Asc"] = 20] = "Asc";
    Operator[Operator["Desc"] = 21] = "Desc";
    Operator[Operator["Limit"] = 22] = "Limit";
    Operator[Operator["Comma"] = 23] = "Comma";
    Operator[Operator["Count"] = 24] = "Count";
    Operator[Operator["Sum"] = 25] = "Sum";
    Operator[Operator["Min"] = 26] = "Min";
    Operator[Operator["Max"] = 27] = "Max";
    Operator[Operator["Avg"] = 28] = "Avg";
})(exports.Operator || (exports.Operator = {}));
var Operator = exports.Operator;
class SqlExpression extends ISqlNode {
    constructor(value, operator, ...expressions) {
        super();
        this._alias = "";
        this._name = "";
        this._updated = false;
        this.value = null;
        this.exps = null;
        this.operator = null;
        this.value = value;
        this.exps = expressions;
        this.operator = operator;
    }
    set() { }
    get() {
        return null;
    }
    add(...expressions) {
        if (this.operator == Operator.And) {
            this.exps = this.exps.concat(expressions);
            return this;
        }
        else {
            let exp = new SqlExpression(null, Operator.And, this);
            for (var i = 0; i < expressions.length; i++) {
                exp.add(expressions[i]);
            }
            return exp;
        }
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
                case Operator.Plus:
                    r = val0 + " + " + val1;
                    break;
                case Operator.Minus:
                    r = val0 + " - " + val1;
                    break;
                case Operator.Multiply:
                    r = val0 + " * " + val1;
                    break;
                case Operator.Devide:
                    r = val0 + " / " + val1;
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
                        r = " limit " + val0 + (val1 ? "," + val1 : "");
                    }
                    break;
                case Operator.Comma:
                    {
                        for (let i = 0; i < values.length; i++)
                            r = r.concat(values[i], ", ");
                        r = r.slice(0, r.length - 2);
                    }
                    break;
                case Operator.Count:
                    r = "count(" + val0 + ")";
                    break;
                case Operator.Sum:
                    r = "sum(" + val0 + ")";
                    break;
                case Operator.Min:
                    r = "min(" + val0 + ")";
                    break;
                case Operator.Max:
                    r = "max(" + val0 + ")";
                    break;
                case Operator.Avg:
                    r = "avg(" + val0 + ")";
                    break;
                default:
                    break;
            }
            return r;
        }
    }
    _createExpr() {
        return this;
    }
    _argExp(operand) {
        let w = null;
        if (operand instanceof Column) {
            w = operand._createExpr();
        }
        else {
            w = new SqlExpression("?");
            w.args = w.args.concat(operand);
        }
        return w;
    }
    eq(operand) {
        return new SqlExpression(null, Operator.Equal, this._createExpr(), this._argExp(operand));
    }
    neq(operand) {
        return new SqlExpression(null, Operator.NotEqual, this._createExpr(), this._argExp(operand));
    }
    lt(operand) {
        return new SqlExpression(null, Operator.LessThan, this._createExpr(), this._argExp(operand));
    }
    gt(operand) {
        return new SqlExpression(null, Operator.GreaterThan, this._createExpr(), this._argExp(operand));
    }
    lteq(operand) {
        return new SqlExpression(null, Operator.LessThanEqual, this._createExpr(), this._argExp(operand));
    }
    gteq(operand) {
        return new SqlExpression(null, Operator.GreaterThanEqual, this._createExpr(), this._argExp(operand));
    }
    and(operand) {
        return new SqlExpression(null, Operator.And, this._createExpr(), this._argExp(operand));
    }
    or(operand) {
        return new SqlExpression(null, Operator.Or, this._createExpr(), this._argExp(operand));
    }
    not() {
        return new SqlExpression(null, Operator.Not, this._createExpr());
    }
    in(...operand) {
        let arg = new SqlExpression(null, Operator.Comma);
        for (let i = 0; i < operand.length; i++) {
            arg.exps.push(this._argExp(operand[i]));
        }
        return new SqlExpression(null, Operator.In, this._createExpr(), arg);
    }
    between(first, second) {
        return new SqlExpression(null, Operator.Between, this._createExpr(), this._argExp(first), this._argExp(second));
    }
    like(operand) {
        return new SqlExpression(null, Operator.Like, this._createExpr(), this._argExp(operand));
    }
    IsNull() {
        return new SqlExpression(null, Operator.IsNull, this._createExpr());
    }
    IsNotNull() {
        return new SqlExpression(null, Operator.IsNotNull, this._createExpr());
    }
    plus(operand) {
        return new SqlExpression(null, Operator.Plus, this._createExpr(), this._argExp(operand));
    }
    minus(operand) {
        return new SqlExpression(null, Operator.Minus, this._createExpr(), this._argExp(operand));
    }
    multiply(operand) {
        return new SqlExpression(null, Operator.Multiply, this._createExpr(), this._argExp(operand));
    }
    devide(operand) {
        return new SqlExpression(null, Operator.Devide, this._createExpr(), this._argExp(operand));
    }
    asc() {
        return new SqlExpression(null, Operator.Asc, this._createExpr());
    }
    desc() {
        return new SqlExpression(null, Operator.Desc, this._createExpr());
    }
    sum() {
        return new SqlExpression(null, Operator.Sum, this._createExpr());
    }
    min() {
        return new SqlExpression(null, Operator.Min, this._createExpr());
    }
    max() {
        return new SqlExpression(null, Operator.Max, this._createExpr());
    }
    count() {
        return new SqlExpression(null, Operator.Count, this._createExpr());
    }
    average() {
        return new SqlExpression(null, Operator.Avg, this._createExpr());
    }
}
exports.SqlExpression = SqlExpression;
