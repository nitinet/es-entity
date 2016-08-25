"use strict";
const Query = require("./Query");
class Field {
    constructor() {
        this._alias = "";
        this._name = "";
        this._value = null;
        this._updated = false;
    }
    get val() {
        return this._value;
    }
    set val(value) {
        this._updated = true;
        this._value = value;
    }
    _createExpr() {
        let name = this._alias ? this._alias + "." + this._name : this._name;
        return new Query.SqlExpression(name);
    }
    _argExp(operand) {
        let w = null;
        if (operand instanceof Query.Column) {
            w = operand._createExpr();
        }
        else {
            w = new Query.SqlExpression("?");
            w.args = w.args.concat(operand);
        }
        return w;
    }
    eq(operand) {
        return new Query.SqlExpression(null, Query.Operator.Equal, this._createExpr(), this._argExp(operand));
    }
    neq(operand) {
        return new Query.SqlExpression(null, Query.Operator.NotEqual, this._createExpr(), this._argExp(operand));
    }
    lt(operand) {
        return new Query.SqlExpression(null, Query.Operator.LessThan, this._createExpr(), this._argExp(operand));
    }
    gt(operand) {
        return new Query.SqlExpression(null, Query.Operator.GreaterThan, this._createExpr(), this._argExp(operand));
    }
    lteq(operand) {
        return new Query.SqlExpression(null, Query.Operator.LessThanEqual, this._createExpr(), this._argExp(operand));
    }
    gteq(operand) {
        return new Query.SqlExpression(null, Query.Operator.GreaterThanEqual, this._createExpr(), this._argExp(operand));
    }
    and(operand) {
        return new Query.SqlExpression(null, Query.Operator.And, this._createExpr(), this._argExp(operand));
    }
    or(operand) {
        return new Query.SqlExpression(null, Query.Operator.Or, this._createExpr(), this._argExp(operand));
    }
    not() {
        return new Query.SqlExpression(null, Query.Operator.Not, this._createExpr());
    }
    in(...operand) {
        let arg = new Query.SqlExpression(null, Query.Operator.Comma);
        for (let i = 0; i < operand.length; i++) {
            arg.exps.push(this._argExp(operand[i]));
        }
        return new Query.SqlExpression(null, Query.Operator.In, this._createExpr(), arg);
    }
    between(first, second) {
        return new Query.SqlExpression(null, Query.Operator.Between, this._createExpr(), this._argExp(first), this._argExp(second));
    }
    like(operand) {
        return new Query.SqlExpression(null, Query.Operator.Like, this._createExpr(), this._argExp(operand));
    }
    IsNull() {
        return new Query.SqlExpression(null, Query.Operator.IsNull, this._createExpr());
    }
    IsNotNull() {
        return new Query.SqlExpression(null, Query.Operator.IsNotNull, this._createExpr());
    }
    plus(operand) {
        return new Query.SqlExpression(null, Query.Operator.Plus, this._createExpr(), this._argExp(operand));
    }
    minus(operand) {
        return new Query.SqlExpression(null, Query.Operator.Minus, this._createExpr(), this._argExp(operand));
    }
    multiply(operand) {
        return new Query.SqlExpression(null, Query.Operator.Multiply, this._createExpr(), this._argExp(operand));
    }
    devide(operand) {
        return new Query.SqlExpression(null, Query.Operator.Devide, this._createExpr(), this._argExp(operand));
    }
    asc() {
        return new Query.SqlExpression(null, Query.Operator.Asc, this._createExpr());
    }
    desc() {
        return new Query.SqlExpression(null, Query.Operator.Desc, this._createExpr());
    }
    sum() {
        return new Query.SqlExpression(null, Query.Operator.Sum, this._createExpr());
    }
    min() {
        return new Query.SqlExpression(null, Query.Operator.Min, this._createExpr());
    }
    max() {
        return new Query.SqlExpression(null, Query.Operator.Max, this._createExpr());
    }
    count() {
        return new Query.SqlExpression(null, Query.Operator.Count, this._createExpr());
    }
    average() {
        return new Query.SqlExpression(null, Query.Operator.Avg, this._createExpr());
    }
}
exports.Field = Field;
