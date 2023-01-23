import Operator from './types/Operator.js';
class Expression {
    args = new Array();
    value = null;
    operator = null;
    exps = new Array();
    constructor(value, operator, ...expressions) {
        this.value = value;
        this.operator = operator;
        this.exps = expressions;
    }
    add(...expressions) {
        if (!this.operator || this.operator == Operator.And) {
            this.exps = this.exps.concat(expressions);
            return this;
        }
        else {
            let exp = new Expression(null, Operator.And, this);
            expressions.forEach(expr => exp.add(expr));
            return exp;
        }
    }
    and(operand) {
        return new Expression(null, Operator.And, this, operand);
    }
    or(operand) {
        return new Expression(null, Operator.Or, this, operand);
    }
    not() {
        return new Expression(null, Operator.Not, this);
    }
    eval(handler) {
        if (this.value) {
            return this.value;
        }
        else {
            let values = this.exps.map(exp => {
                if (exp) {
                    let str = exp.eval(handler);
                    this.args = this.args.concat(exp.args);
                    return str;
                }
                ;
            }).filter((exp) => exp != null);
            if (!this.operator && this.exps.length > 1) {
                this.operator = Operator.And;
            }
            let val0 = values[0] ? values[0] : '';
            let val1 = values[1] ? values[1] : '';
            let r = '';
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
                    r = handler.between(values[0], values[1], values[2]);
                    break;
                case Operator.Exists:
                    r = handler.exists(val0);
                    break;
                case Operator.In:
                    r = handler.in(values);
                    break;
                case Operator.Like:
                    r = handler.like(val0, val1);
                    break;
                case Operator.IsNull:
                    r = handler.isNull(val0);
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
                    r = handler.limit(val0, val1);
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
    }
}
export default Expression;
//# sourceMappingURL=Expression.js.map