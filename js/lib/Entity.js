"use strict";
const Query = require("./Query");
class Field {
    constructor() {
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
    _createExpr(leftOperand) {
        let w1 = new Query.SqlExpression(this._name);
        let w2 = new Query.SqlExpression("?");
        w2.args = w2.args.concat(leftOperand);
        let res = new Array(w1, w2);
        return res;
    }
    __doubleEqual(operand) {
        let res = this._createExpr(operand);
        let expr = new Query.SqlExpression(null, Query.Operator.Equal, res[0], res[1]);
        return expr;
    }
    __notEqual(operand) {
        let res = this._createExpr(operand);
        let expr = new Query.SqlExpression(null, Query.Operator.NotEqual, res[0], res[1]);
        return expr;
    }
    __lessThan(operand) {
        let res = this._createExpr(operand);
        let expr = new Query.SqlExpression(null, Query.Operator.GreaterThan, res[0], res[1]);
        return expr;
    }
    __greaterThan(operand) {
        let res = this._createExpr(operand);
        let expr = new Query.SqlExpression(null, Query.Operator.LessThan, res[0], res[1]);
        return expr;
    }
    __lessThanEqual(operand) {
        let res = this._createExpr(operand);
        let expr = new Query.SqlExpression(null, Query.Operator.GreaterThanEqual, res[0], res[1]);
        return expr;
    }
    __greaterThanEqual(operand) {
        let res = this._createExpr(operand);
        let expr = new Query.SqlExpression(null, Query.Operator.LessThanEqual, res[0], res[1]);
        return expr;
    }
    __in(operand) {
        let res = this._createExpr(operand);
        let expr = new Query.SqlExpression(null, Query.Operator.In, res[0], res[1]);
        return expr;
    }
}
exports.Field = Field;
class ValOperators {
    __doubleEqual(leftOperand) {
        if (leftOperand instanceof Field) {
            return leftOperand.__doubleEqual(this);
        }
        else {
            return leftOperand == this;
        }
    }
    __notEqual(leftOperand) {
        if (leftOperand instanceof Field) {
            return leftOperand.__notEqual(this);
        }
        else {
            return leftOperand != this;
        }
    }
    __lessThan(leftOperand) {
        if (leftOperand instanceof Field) {
            return leftOperand.__greaterThan(this);
        }
        else {
            return leftOperand < this;
        }
    }
    __greaterThan(leftOperand) {
        if (leftOperand instanceof Field) {
            return leftOperand.__lessThan(this);
        }
        else {
            return leftOperand > this;
        }
    }
    __lessThanEqual(leftOperand) {
        if (leftOperand instanceof Field) {
            return leftOperand.__greaterThanEqual(this);
        }
        else {
            return leftOperand == this;
        }
    }
    __greaterThanEqual(leftOperand) {
        if (leftOperand instanceof Field) {
            return leftOperand.__lessThanEqual(this);
        }
        else {
            return leftOperand == this;
        }
    }
}
function applyMixins(derivedCtor, ...baseCtors) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}
// applyMixins(String, ValOperators);
// applyMixins(Number, ValOperators);
// applyMixins(Boolean, ValOperators);
