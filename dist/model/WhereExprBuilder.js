import Expression from '../sql/Expression.js';
import Operator from '../sql/types/Operator.js';
import BaseExprBuilder from './BaseExprBuilder.js';
class WhereExprBuilder extends BaseExprBuilder {
    constructor(fieldMap, alias) {
        super(fieldMap, alias);
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
        return new Expression(null, Operator.Equal, this._expr(propName), this._argExp(operand));
    }
    neq(propName, operand) {
        return new Expression(null, Operator.NotEqual, this._expr(propName), this._argExp(operand));
    }
    lt(propName, operand) {
        return new Expression(null, Operator.LessThan, this._expr(propName), this._argExp(operand));
    }
    gt(propName, operand) {
        return new Expression(null, Operator.GreaterThan, this._expr(propName), this._argExp(operand));
    }
    lteq(propName, operand) {
        return new Expression(null, Operator.LessThanEqual, this._expr(propName), this._argExp(operand));
    }
    gteq(propName, operand) {
        return new Expression(null, Operator.GreaterThanEqual, this._expr(propName), this._argExp(operand));
    }
    and(propName, operand) {
        return new Expression(null, Operator.And, this._expr(propName), this._argExp(operand));
    }
    or(propName, operand) {
        return new Expression(null, Operator.Or, this._expr(propName), this._argExp(operand));
    }
    not(propName) {
        return new Expression(null, Operator.Not, this._expr(propName));
    }
    in(propName, ...operand) {
        let vals = operand.map(val => {
            let arg = new Expression('?');
            arg.args = arg.args.concat(val);
            return arg;
        });
        return new Expression(null, Operator.In, this._expr(propName), ...vals);
    }
    between(propName, first, second) {
        return new Expression(null, Operator.Between, this._expr(propName), this._argExp(first), this._argExp(second));
    }
    like(propName, operand) {
        return new Expression(null, Operator.Like, this._expr(propName), this._argExp(operand));
    }
    IsNull(propName) {
        return new Expression(null, Operator.IsNull, this._expr(propName));
    }
    IsNotNull(propName) {
        return new Expression(null, Operator.IsNotNull, this._expr(propName));
    }
    plus(propName, operand) {
        return new Expression(null, Operator.Plus, this._expr(propName), this._argExp(operand));
    }
    minus(propName, operand) {
        return new Expression(null, Operator.Minus, this._expr(propName), this._argExp(operand));
    }
    multiply(propName, operand) {
        return new Expression(null, Operator.Multiply, this._expr(propName), this._argExp(operand));
    }
    devide(propName, operand) {
        return new Expression(null, Operator.Devide, this._expr(propName), this._argExp(operand));
    }
    sum(propName) {
        return new Expression(null, Operator.Sum, this._expr(propName));
    }
    min(propName) {
        return new Expression(null, Operator.Min, this._expr(propName));
    }
    max(propName) {
        return new Expression(null, Operator.Max, this._expr(propName));
    }
    count(propName) {
        return new Expression(null, Operator.Count, this._expr(propName));
    }
    average(propName) {
        return new Expression(null, Operator.Avg, this._expr(propName));
    }
}
export default WhereExprBuilder;
//# sourceMappingURL=WhereExprBuilder.js.map