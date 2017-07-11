"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var Handler_1 = require("./Handler");
var ISqlNode = (function () {
    function ISqlNode() {
        this.args = new Array();
    }
    return ISqlNode;
}());
exports.ISqlNode = ISqlNode;
/**
 * SqlStatement
 */
var SqlStatement = (function (_super) {
    __extends(SqlStatement, _super);
    function SqlStatement() {
        var _this = _super.call(this) || this;
        _this.command = "";
        _this.columns = new Array();
        _this.values = new Array();
        _this.collection = new SqlCollection();
        _this.where = new SqlExpression();
        _this.groupBy = new Array();
        _this.orderBy = new Array();
        _this.limit = new SqlExpression();
        return _this;
    }
    SqlStatement.prototype.eval = function (handler) {
        if (!handler) {
            handler = new Handler_1["default"]();
        }
        var result = "";
        // Column
        var columnStr = "";
        for (var i = 0; i < this.columns.length; i++) {
            var element = this.columns[i];
            var val = element.eval(handler);
            if (i == 0)
                columnStr = columnStr.concat(" " + val);
            else
                columnStr = columnStr.concat(", " + val);
            this.args = this.args.concat(element.args);
        }
        // Collection
        var collectionStr = this.collection.eval(handler);
        this.args = this.args.concat(this.collection.args);
        // Where
        var whereStr = this.where.eval(handler);
        this.args = this.args.concat(this.where.args);
        // Group By
        var groupByStr = "";
        for (var i = 0; i < this.groupBy.length; i++) {
            var element = this.groupBy[i];
            var val = element.eval(handler);
            if (i == 0)
                groupByStr = groupByStr.concat(" " + val);
            else
                groupByStr = groupByStr.concat(", " + val);
            this.args = this.args.concat(element.args);
        }
        // Order By
        var orderByStr = "";
        for (var i = 0; i < this.orderBy.length; i++) {
            var element = this.orderBy[i];
            var val = element.eval(handler);
            if (i == 0)
                orderByStr = orderByStr.concat(" " + val);
            else
                orderByStr = orderByStr.concat(", " + val);
            this.args = this.args.concat(element.args);
        }
        // Where
        var limitStr = this.limit.eval(handler);
        this.args = this.args.concat(this.limit.args);
        // Values
        var valueStr = "";
        for (var i = 0; i < this.values.length; i++) {
            var element = this.values[i];
            var val = element.eval(handler);
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
    };
    return SqlStatement;
}(ISqlNode));
exports.SqlStatement = SqlStatement;
/**
 * SqlCollection
 * Used for tables and columns
 */
var SqlCollection = (function (_super) {
    __extends(SqlCollection, _super);
    function SqlCollection() {
        var _this = _super.call(this) || this;
        _this.colAlias = null;
        _this.value = null;
        _this.stat = null;
        _this.alias = null;
        return _this;
    }
    SqlCollection.prototype.eval = function (handler) {
        var result = "";
        if (this.value)
            result = this.colAlias ? this.colAlias + "." + this.value : this.value;
        else if (this.stat) {
            this.args = this.args.concat(this.stat.args);
            result = "(" + this.stat.eval(handler) + ")";
        }
        if (!result) {
            throw "No Collection Found";
        }
        if (this.alias)
            result = result.concat(" as ", this.alias);
        return result;
    };
    return SqlCollection;
}(ISqlNode));
exports.SqlCollection = SqlCollection;
var Column = (function () {
    function Column() {
        this._alias = "";
        this._name = "";
        this._updated = false;
    }
    return Column;
}());
exports.Column = Column;
var Operator;
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
})(Operator = exports.Operator || (exports.Operator = {}));
/**
 * SqlExpression
 */
var SqlExpression = (function (_super) {
    __extends(SqlExpression, _super);
    function SqlExpression(value, operator) {
        var expressions = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            expressions[_i - 2] = arguments[_i];
        }
        var _this = _super.call(this) || this;
        _this._alias = "";
        _this._name = "";
        _this._updated = false;
        _this.value = null;
        _this.exps = null;
        _this.operator = null;
        _this.value = value;
        _this.exps = expressions;
        _this.operator = operator;
        return _this;
    }
    SqlExpression.prototype.set = function () { };
    SqlExpression.prototype.get = function () {
        return null;
    };
    SqlExpression.prototype.add = function () {
        var expressions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            expressions[_i] = arguments[_i];
        }
        if (this.operator == Operator.And) {
            this.exps = this.exps.concat(expressions);
            return this;
        }
        else if (!this.operator && this.exps.length == 0) {
            var exp = expressions.pop();
            for (var i = 0; i < expressions.length; i++) {
                exp.add(expressions[i]);
            }
            return exp;
        }
        else {
            var exp = new SqlExpression(null, Operator.And, this);
            for (var i = 0; i < expressions.length; i++) {
                exp.add(expressions[i]);
            }
            return exp;
        }
    };
    SqlExpression.prototype.eval = function (handler) {
        if (this.value) {
            return this.value;
        }
        else if (this.exps) {
            var values = new Array();
            for (var i = 0; i < this.exps.length; i++) {
                values[i] = this.exps[i].eval(handler);
                this.args = this.args.concat(this.exps[i].args);
            }
            if (!this.operator && this.exps.length > 1) {
                this.operator = Operator.And;
            }
            var val0 = values[0] = values[0] ? values[0] : "";
            var val1 = values[1] = values[1] ? values[1] : "";
            var r = "";
            switch (this.operator) {
                case Operator.Equal:
                    r = handler.eq(val0, val1);
                    break;
                case Operator.NotEqual:
                    r = handler.neq(val0, val1);
                    break;
                case Operator.LessThan:
                    r = handler.lt(val0, val1);
                    break;
                case Operator.LessThanEqual:
                    r = handler.lteq(val0, val1);
                    break;
                case Operator.GreaterThan:
                    r = handler.gt(val0, val1);
                    break;
                case Operator.GreaterThanEqual:
                    r = handler.gteq(val0, val1);
                    break;
                case Operator.And:
                    r = handler.and(values);
                    break;
                case Operator.Or:
                    r = handler.or(values);
                    break;
                case Operator.Not:
                    r = handler.not(val0);
                    break;
                case Operator.Plus:
                    r = handler.plus(val0, val1);
                    break;
                case Operator.Minus:
                    r = handler.minus(val0, val1);
                    break;
                case Operator.Multiply:
                    r = handler.multiply(val0, val1);
                    break;
                case Operator.Devide:
                    r = handler.devide(val0, val1);
                    break;
                case Operator.Between:
                    r = handler.between(values);
                    break;
                case Operator.Exists:
                    r = handler.exists(val0);
                    break;
                case Operator.In:
                    r = handler["in"](val0, val1);
                    break;
                case Operator.Like:
                    r = handler.like(val0, val1);
                    break;
                case Operator.IsNull:
                    r = handler.isNull(val0);
                    ;
                    break;
                case Operator.IsNotNull:
                    r = handler.isNotNull(val0);
                    break;
                case Operator.Asc:
                    r = handler.asc(val0);
                    break;
                case Operator.Desc:
                    r = handler.desc(val0);
                    break;
                case Operator.Limit:
                    {
                        r = handler.limit(val0, val1);
                    }
                    break;
                case Operator.Comma:
                    {
                        for (var i = 0; i < values.length; i++)
                            r = r.concat(values[i], ", ");
                        r = r.slice(0, r.length - 2);
                    }
                    break;
                case Operator.Count:
                    r = handler.count(val0);
                    break;
                case Operator.Sum:
                    r = handler.sum(val0);
                    break;
                case Operator.Min:
                    r = handler.min(val0);
                    break;
                case Operator.Max:
                    r = handler.max(val0);
                    break;
                case Operator.Avg:
                    r = handler.average(val0);
                    break;
                default:
                    break;
            }
            return r;
        }
    };
    SqlExpression.prototype._createExpr = function () {
        return this;
    };
    SqlExpression.prototype._argExp = function (operand) {
        var w = null;
        if (operand instanceof Column || operand instanceof SqlExpression) {
            w = operand._createExpr();
        }
        else {
            w = new SqlExpression("?");
            w.args = w.args.concat(operand);
        }
        return w;
    };
    // Column Interface functions
    // Comparison Operators
    SqlExpression.prototype.eq = function (operand) {
        return new SqlExpression(null, Operator.Equal, this._createExpr(), this._argExp(operand));
    };
    SqlExpression.prototype.neq = function (operand) {
        return new SqlExpression(null, Operator.NotEqual, this._createExpr(), this._argExp(operand));
    };
    SqlExpression.prototype.lt = function (operand) {
        return new SqlExpression(null, Operator.LessThan, this._createExpr(), this._argExp(operand));
    };
    SqlExpression.prototype.gt = function (operand) {
        return new SqlExpression(null, Operator.GreaterThan, this._createExpr(), this._argExp(operand));
    };
    SqlExpression.prototype.lteq = function (operand) {
        return new SqlExpression(null, Operator.LessThanEqual, this._createExpr(), this._argExp(operand));
    };
    SqlExpression.prototype.gteq = function (operand) {
        return new SqlExpression(null, Operator.GreaterThanEqual, this._createExpr(), this._argExp(operand));
    };
    // Logical Operators
    SqlExpression.prototype.and = function (operand) {
        return new SqlExpression(null, Operator.And, this._createExpr(), this._argExp(operand));
    };
    SqlExpression.prototype.or = function (operand) {
        return new SqlExpression(null, Operator.Or, this._createExpr(), this._argExp(operand));
    };
    SqlExpression.prototype.not = function () {
        return new SqlExpression(null, Operator.Not, this._createExpr());
    };
    // Inclusion Funtions
    SqlExpression.prototype["in"] = function () {
        var operand = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operand[_i] = arguments[_i];
        }
        var arg = new SqlExpression(null, Operator.Comma);
        for (var i = 0; i < operand.length; i++) {
            arg.exps.push(this._argExp(operand[i]));
        }
        return new SqlExpression(null, Operator.In, this._createExpr(), arg);
    };
    SqlExpression.prototype.between = function (first, second) {
        return new SqlExpression(null, Operator.Between, this._createExpr(), this._argExp(first), this._argExp(second));
    };
    SqlExpression.prototype.like = function (operand) {
        return new SqlExpression(null, Operator.Like, this._createExpr(), this._argExp(operand));
    };
    SqlExpression.prototype.IsNull = function () {
        return new SqlExpression(null, Operator.IsNull, this._createExpr());
    };
    SqlExpression.prototype.IsNotNull = function () {
        return new SqlExpression(null, Operator.IsNotNull, this._createExpr());
    };
    // Arithmatic Operators
    SqlExpression.prototype.plus = function (operand) {
        return new SqlExpression(null, Operator.Plus, this._createExpr(), this._argExp(operand));
    };
    SqlExpression.prototype.minus = function (operand) {
        return new SqlExpression(null, Operator.Minus, this._createExpr(), this._argExp(operand));
    };
    SqlExpression.prototype.multiply = function (operand) {
        return new SqlExpression(null, Operator.Multiply, this._createExpr(), this._argExp(operand));
    };
    SqlExpression.prototype.devide = function (operand) {
        return new SqlExpression(null, Operator.Devide, this._createExpr(), this._argExp(operand));
    };
    // Sorting Operators
    SqlExpression.prototype.asc = function () {
        return new SqlExpression(null, Operator.Asc, this._createExpr());
    };
    SqlExpression.prototype.desc = function () {
        return new SqlExpression(null, Operator.Desc, this._createExpr());
    };
    // Group Functions
    SqlExpression.prototype.sum = function () {
        return new SqlExpression(null, Operator.Sum, this._createExpr());
    };
    SqlExpression.prototype.min = function () {
        return new SqlExpression(null, Operator.Min, this._createExpr());
    };
    SqlExpression.prototype.max = function () {
        return new SqlExpression(null, Operator.Max, this._createExpr());
    };
    SqlExpression.prototype.count = function () {
        return new SqlExpression(null, Operator.Count, this._createExpr());
    };
    SqlExpression.prototype.average = function () {
        return new SqlExpression(null, Operator.Avg, this._createExpr());
    };
    return SqlExpression;
}(ISqlNode));
exports.SqlExpression = SqlExpression;
