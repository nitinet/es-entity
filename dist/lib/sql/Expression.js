"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Operator_1 = require("./Operator");
const Column_1 = require("./Column");
class Field extends Column_1.default {
    constructor() {
        super();
        this._value = null;
        this._alias = '';
        this._name = '';
        this._updated = false;
    }
    get() {
        return this._value;
    }
    set(value) {
        if (value !== this._value) {
            this._updated = true;
            this._value = value;
        }
    }
    toJSON() {
        if (this._value != null) {
            return this._value.valueOf();
        }
        else {
            return null;
        }
    }
    _createExpr() {
        let name = this._alias ? this._alias + '.' + this._name : this._name;
        return new Expression(name);
    }
    _argExp(operand) {
        let w = null;
        if (operand instanceof Column_1.default) {
            w = operand._createExpr();
        }
        else {
            w = new Expression('?');
            w.args = w.args.concat(operand);
        }
        return w;
    }
    eq(operand) {
        return new Expression(null, Operator_1.default.Equal, this._createExpr(), this._argExp(operand));
    }
    neq(operand) {
        return new Expression(null, Operator_1.default.NotEqual, this._createExpr(), this._argExp(operand));
    }
    lt(operand) {
        return new Expression(null, Operator_1.default.LessThan, this._createExpr(), this._argExp(operand));
    }
    gt(operand) {
        return new Expression(null, Operator_1.default.GreaterThan, this._createExpr(), this._argExp(operand));
    }
    lteq(operand) {
        return new Expression(null, Operator_1.default.LessThanEqual, this._createExpr(), this._argExp(operand));
    }
    gteq(operand) {
        return new Expression(null, Operator_1.default.GreaterThanEqual, this._createExpr(), this._argExp(operand));
    }
    and(operand) {
        return new Expression(null, Operator_1.default.And, this._createExpr(), this._argExp(operand));
    }
    or(operand) {
        return new Expression(null, Operator_1.default.Or, this._createExpr(), this._argExp(operand));
    }
    not() {
        return new Expression(null, Operator_1.default.Not, this._createExpr());
    }
    in(...operand) {
        let arg = new Expression(null, Operator_1.default.Comma);
        for (let i = 0; i < operand.length; i++) {
            arg.exps.push(this._argExp(operand[i]));
        }
        return new Expression(null, Operator_1.default.In, this._createExpr(), arg);
    }
    between(first, second) {
        return new Expression(null, Operator_1.default.Between, this._createExpr(), this._argExp(first), this._argExp(second));
    }
    like(operand) {
        return new Expression(null, Operator_1.default.Like, this._createExpr(), this._argExp(operand));
    }
    IsNull() {
        return new Expression(null, Operator_1.default.IsNull, this._createExpr());
    }
    IsNotNull() {
        return new Expression(null, Operator_1.default.IsNotNull, this._createExpr());
    }
    plus(operand) {
        return new Expression(null, Operator_1.default.Plus, this._createExpr(), this._argExp(operand));
    }
    minus(operand) {
        return new Expression(null, Operator_1.default.Minus, this._createExpr(), this._argExp(operand));
    }
    multiply(operand) {
        return new Expression(null, Operator_1.default.Multiply, this._createExpr(), this._argExp(operand));
    }
    devide(operand) {
        return new Expression(null, Operator_1.default.Devide, this._createExpr(), this._argExp(operand));
    }
    asc() {
        return new Expression(null, Operator_1.default.Asc, this._createExpr());
    }
    desc() {
        return new Expression(null, Operator_1.default.Desc, this._createExpr());
    }
    sum() {
        return new Expression(null, Operator_1.default.Sum, this._createExpr());
    }
    min() {
        return new Expression(null, Operator_1.default.Min, this._createExpr());
    }
    max() {
        return new Expression(null, Operator_1.default.Max, this._createExpr());
    }
    count() {
        return new Expression(null, Operator_1.default.Count, this._createExpr());
    }
    average() {
        return new Expression(null, Operator_1.default.Avg, this._createExpr());
    }
}
exports.Field = Field;
class Expression extends Field {
    constructor(value, operator, ...expressions) {
        super();
        this.args = new Array();
        this._alias = '';
        this._name = '';
        this._updated = false;
        this.value = null;
        this.exps = null;
        this.operator = null;
        this.value = value;
        this.exps = expressions;
        this.operator = operator;
    }
    add(...expressions) {
        if (this.operator == Operator_1.default.And) {
            this.exps = this.exps.concat(expressions);
            return this;
        }
        else if (!this.operator && this.exps.length == 0) {
            let exp = expressions.pop();
            for (var i = 0; i < expressions.length; i++) {
                exp.add(expressions[i]);
            }
            return exp;
        }
        else {
            let exp = new Expression(null, Operator_1.default.And, this);
            for (var i = 0; i < expressions.length; i++) {
                exp.add(expressions[i]);
            }
            return exp;
        }
    }
    eval(handler) {
        if (this.value) {
            return this.value;
        }
        else if (this.exps) {
            let values = new Array();
            for (let i = 0; i < this.exps.length; i++) {
                values[i] = this.exps[i].eval(handler);
                this.args = this.args.concat(this.exps[i].args);
            }
            if (!this.operator && this.exps.length > 1) {
                this.operator = Operator_1.default.And;
            }
            let val0 = values[0] = values[0] ? values[0] : '';
            let val1 = values[1] = values[1] ? values[1] : '';
            let r = '';
            switch (this.operator) {
                case Operator_1.default.Equal:
                    r = handler.eq(val0, val1);
                    break;
                case Operator_1.default.NotEqual:
                    r = handler.neq(val0, val1);
                    break;
                case Operator_1.default.LessThan:
                    r = handler.lt(val0, val1);
                    break;
                case Operator_1.default.LessThanEqual:
                    r = handler.lteq(val0, val1);
                    break;
                case Operator_1.default.GreaterThan:
                    r = handler.gt(val0, val1);
                    break;
                case Operator_1.default.GreaterThanEqual:
                    r = handler.gteq(val0, val1);
                    break;
                case Operator_1.default.And:
                    r = handler.and(values);
                    break;
                case Operator_1.default.Or:
                    r = handler.or(values);
                    break;
                case Operator_1.default.Not:
                    r = handler.not(val0);
                    break;
                case Operator_1.default.Plus:
                    r = handler.plus(val0, val1);
                    break;
                case Operator_1.default.Minus:
                    r = handler.minus(val0, val1);
                    break;
                case Operator_1.default.Multiply:
                    r = handler.multiply(val0, val1);
                    break;
                case Operator_1.default.Devide:
                    r = handler.devide(val0, val1);
                    break;
                case Operator_1.default.Between:
                    r = handler.between(values);
                    break;
                case Operator_1.default.Exists:
                    r = handler.exists(val0);
                    break;
                case Operator_1.default.In:
                    r = handler.in(val0, val1);
                    break;
                case Operator_1.default.Like:
                    r = handler.like(val0, val1);
                    break;
                case Operator_1.default.IsNull:
                    r = handler.isNull(val0);
                    ;
                    break;
                case Operator_1.default.IsNotNull:
                    r = handler.isNotNull(val0);
                    break;
                case Operator_1.default.Asc:
                    r = handler.asc(val0);
                    break;
                case Operator_1.default.Desc:
                    r = handler.desc(val0);
                    break;
                case Operator_1.default.Limit:
                    {
                        r = handler.limit(val0, val1);
                    }
                    break;
                case Operator_1.default.Comma:
                    {
                        for (let i = 0; i < values.length; i++)
                            r = r.concat(values[i], ', ');
                        r = r.slice(0, r.length - 2);
                    }
                    break;
                case Operator_1.default.Count:
                    r = handler.count(val0);
                    break;
                case Operator_1.default.Sum:
                    r = handler.sum(val0);
                    break;
                case Operator_1.default.Min:
                    r = handler.min(val0);
                    break;
                case Operator_1.default.Max:
                    r = handler.max(val0);
                    break;
                case Operator_1.default.Avg:
                    r = handler.average(val0);
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
}
exports.default = Expression;
