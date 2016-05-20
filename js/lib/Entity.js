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
    _argExp(leftOperand) {
        let w = new Query.SqlExpression("?");
        w.args = w.args.concat(leftOperand);
        return w;
    }
    eq(operand) {
        let w1 = this._createExpr();
        let w2 = this._argExp(operand);
        let expr = new Query.SqlExpression(null, Query.Operator.Equal, w1, w2);
        return expr;
    }
    neq(operand) {
        let w1 = this._createExpr();
        let w2 = this._argExp(operand);
        let expr = new Query.SqlExpression(null, Query.Operator.NotEqual, w1, w2);
        return expr;
    }
    lt(operand) {
        let w1 = this._createExpr();
        let w2 = this._argExp(operand);
        let expr = new Query.SqlExpression(null, Query.Operator.LessThan, w1, w2);
        return expr;
    }
    gt(operand) {
        let w1 = this._createExpr();
        let w2 = this._argExp(operand);
        let expr = new Query.SqlExpression(null, Query.Operator.GreaterThan, w1, w2);
        return expr;
    }
    lteq(operand) {
        let w1 = this._createExpr();
        let w2 = this._argExp(operand);
        let expr = new Query.SqlExpression(null, Query.Operator.LessThanEqual, w1, w2);
        return expr;
    }
    gteq(operand) {
        let w1 = this._createExpr();
        let w2 = this._argExp(operand);
        let expr = new Query.SqlExpression(null, Query.Operator.GreaterThanEqual, w1, w2);
        return expr;
    }
    in(...operand) {
        let w1 = this._createExpr();
        let w2 = new Query.SqlExpression(null, Query.Operator.Comma);
        for (let i = 0; i < operand.length; i++) {
            w2.exps.push(this._argExp(operand[i]));
        }
        let expr = new Query.SqlExpression(null, Query.Operator.In, w1, w2);
        return expr;
    }
    between(first, second) {
        let w1 = this._createExpr();
        let w2 = this._argExp(first);
        let w3 = this._argExp(second);
        let expr = new Query.SqlExpression(null, Query.Operator.Between, w1, w2, w3);
        return expr;
    }
    like(operand) {
        let w1 = this._createExpr();
        let w2 = this._argExp(operand);
        let expr = new Query.SqlExpression(null, Query.Operator.Like, w1, w2);
        return expr;
    }
    IsNull() {
        let w1 = this._createExpr();
        let expr = new Query.SqlExpression(null, Query.Operator.IsNull, w1);
        return expr;
    }
    IsNotNull() {
        let w1 = this._createExpr();
        let expr = new Query.SqlExpression(null, Query.Operator.IsNotNull, w1);
        return expr;
    }
}
exports.Field = Field;
