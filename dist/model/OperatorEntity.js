import Expression from '../sql/Expression.js';
import Operator from '../sql/types/Operator.js';
class OperatorEntity {
    fieldMap = null;
    alias = null;
    constructor(fieldMap, alias) {
        this.fieldMap = fieldMap;
        this.alias = alias;
    }
    expr(propName) {
        let field = this.fieldMap.get(propName);
        let name = this.alias ? this.alias + '.' + field.colName : field.colName;
        return new Expression(name);
    }
    _argExp(operand) {
        let res = null;
        if (operand instanceof Expression) {
            res = operand;
        }
        else {
            res = new Expression('?');
            res.args = res.args.concat(operand);
        }
        return res;
    }
    eq(propName, operand) {
        return new Expression(null, Operator.Equal, this.expr(propName), this._argExp(operand));
    }
    neq(propName, operand) {
        return new Expression(null, Operator.NotEqual, this.expr(propName), this._argExp(operand));
    }
    lt(propName, operand) {
        return new Expression(null, Operator.LessThan, this.expr(propName), this._argExp(operand));
    }
    gt(propName, operand) {
        return new Expression(null, Operator.GreaterThan, this.expr(propName), this._argExp(operand));
    }
    lteq(propName, operand) {
        return new Expression(null, Operator.LessThanEqual, this.expr(propName), this._argExp(operand));
    }
    gteq(propName, operand) {
        return new Expression(null, Operator.GreaterThanEqual, this.expr(propName), this._argExp(operand));
    }
    and(propName, operand) {
        return new Expression(null, Operator.And, this.expr(propName), this._argExp(operand));
    }
    or(propName, operand) {
        return new Expression(null, Operator.Or, this.expr(propName), this._argExp(operand));
    }
    not(propName) {
        return new Expression(null, Operator.Not, this.expr(propName));
    }
    in(propName, ...operand) {
        let vals = operand.map(val => {
            let arg = new Expression('?');
            arg.args = arg.args.concat(val);
            return arg;
        });
        return new Expression(null, Operator.In, this.expr(propName), ...vals);
    }
    between(propName, first, second) {
        return new Expression(null, Operator.Between, this.expr(propName), this._argExp(first), this._argExp(second));
    }
    like(propName, operand) {
        return new Expression(null, Operator.Like, this.expr(propName), this._argExp(operand));
    }
    IsNull(propName) {
        return new Expression(null, Operator.IsNull, this.expr(propName));
    }
    IsNotNull(propName) {
        return new Expression(null, Operator.IsNotNull, this.expr(propName));
    }
    plus(propName, operand) {
        return new Expression(null, Operator.Plus, this.expr(propName), this._argExp(operand));
    }
    minus(propName, operand) {
        return new Expression(null, Operator.Minus, this.expr(propName), this._argExp(operand));
    }
    multiply(propName, operand) {
        return new Expression(null, Operator.Multiply, this.expr(propName), this._argExp(operand));
    }
    devide(propName, operand) {
        return new Expression(null, Operator.Devide, this.expr(propName), this._argExp(operand));
    }
    sum(propName) {
        return new Expression(null, Operator.Sum, this.expr(propName));
    }
    min(propName) {
        return new Expression(null, Operator.Min, this.expr(propName));
    }
    max(propName) {
        return new Expression(null, Operator.Max, this.expr(propName));
    }
    count(propName) {
        return new Expression(null, Operator.Count, this.expr(propName));
    }
    average(propName) {
        return new Expression(null, Operator.Avg, this.expr(propName));
    }
}
export default OperatorEntity;
