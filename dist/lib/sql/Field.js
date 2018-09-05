"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Column_1 = require("./Column");
const Expression_1 = require("./Expression");
const Operator_1 = require("./Operator");
class Field extends Column_1.default {
    _createExpr() {
        let name = this._alias ? this._alias + '.' + this._name : this._name;
        return new Expression_1.default(name);
    }
    _argExp(operand) {
        let w = null;
        if (operand instanceof Column_1.default) {
            w = operand._createExpr();
        }
        else {
            w = new Expression_1.default('?');
            w.args = w.args.concat(operand);
        }
        return w;
    }
    eq(operand) {
        return new Expression_1.default(null, Operator_1.default.Equal, this._createExpr(), this._argExp(operand));
    }
    neq(operand) {
        return new Expression_1.default(null, Operator_1.default.NotEqual, this._createExpr(), this._argExp(operand));
    }
    lt(operand) {
        return new Expression_1.default(null, Operator_1.default.LessThan, this._createExpr(), this._argExp(operand));
    }
    gt(operand) {
        return new Expression_1.default(null, Operator_1.default.GreaterThan, this._createExpr(), this._argExp(operand));
    }
    lteq(operand) {
        return new Expression_1.default(null, Operator_1.default.LessThanEqual, this._createExpr(), this._argExp(operand));
    }
    gteq(operand) {
        return new Expression_1.default(null, Operator_1.default.GreaterThanEqual, this._createExpr(), this._argExp(operand));
    }
    and(operand) {
        return new Expression_1.default(null, Operator_1.default.And, this._createExpr(), this._argExp(operand));
    }
    or(operand) {
        return new Expression_1.default(null, Operator_1.default.Or, this._createExpr(), this._argExp(operand));
    }
    not() {
        return new Expression_1.default(null, Operator_1.default.Not, this._createExpr());
    }
    in(...operand) {
        let arg = new Expression_1.default(null, Operator_1.default.Comma);
        for (let i = 0; i < operand.length; i++) {
            arg.exps.push(this._argExp(operand[i]));
        }
        return new Expression_1.default(null, Operator_1.default.In, this._createExpr(), arg);
    }
    between(first, second) {
        return new Expression_1.default(null, Operator_1.default.Between, this._createExpr(), this._argExp(first), this._argExp(second));
    }
    like(operand) {
        return new Expression_1.default(null, Operator_1.default.Like, this._createExpr(), this._argExp(operand));
    }
    IsNull() {
        return new Expression_1.default(null, Operator_1.default.IsNull, this._createExpr());
    }
    IsNotNull() {
        return new Expression_1.default(null, Operator_1.default.IsNotNull, this._createExpr());
    }
    plus(operand) {
        return new Expression_1.default(null, Operator_1.default.Plus, this._createExpr(), this._argExp(operand));
    }
    minus(operand) {
        return new Expression_1.default(null, Operator_1.default.Minus, this._createExpr(), this._argExp(operand));
    }
    multiply(operand) {
        return new Expression_1.default(null, Operator_1.default.Multiply, this._createExpr(), this._argExp(operand));
    }
    devide(operand) {
        return new Expression_1.default(null, Operator_1.default.Devide, this._createExpr(), this._argExp(operand));
    }
    asc() {
        return new Expression_1.default(null, Operator_1.default.Asc, this._createExpr());
    }
    desc() {
        return new Expression_1.default(null, Operator_1.default.Desc, this._createExpr());
    }
    sum() {
        return new Expression_1.default(null, Operator_1.default.Sum, this._createExpr());
    }
    min() {
        return new Expression_1.default(null, Operator_1.default.Min, this._createExpr());
    }
    max() {
        return new Expression_1.default(null, Operator_1.default.Max, this._createExpr());
    }
    count() {
        return new Expression_1.default(null, Operator_1.default.Count, this._createExpr());
    }
    average() {
        return new Expression_1.default(null, Operator_1.default.Avg, this._createExpr());
    }
}
exports.default = Field;
