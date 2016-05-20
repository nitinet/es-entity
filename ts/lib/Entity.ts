import * as Query from "./Query";

export interface IEntityType<T> {
    new (): T;
}

export class Field {
    _alias: string = "";
    _name: string = "";
    _value: any = null;
    _updated: boolean = false;

    constructor() {
    }

    get val() {
        return this._value;
    }

    set val(value: any) {
        this._updated = true;
        this._value = value;
    }

    _createExpr(): Query.SqlExpression {
        let name = this._alias ? this._alias + "." + this._name : this._name;
        return new Query.SqlExpression(name);
    }

    _argExp(operand: any): Query.SqlExpression {
        let w: Query.SqlExpression = null;
        if (operand instanceof Field) {
            w = (<Field>operand)._createExpr();
        } else if (operand instanceof Query.SqlExpression) {
            w = (<Query.SqlExpression>operand);
        } else {
            w = new Query.SqlExpression("?");
            w.args = w.args.concat(operand);
        }
        return w;
    }

    eq(operand: any): Query.SqlExpression {
        let w1: Query.SqlExpression = this._createExpr();
        let w2: Query.SqlExpression = this._argExp(operand);
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.Equal, w1, w2);
        return expr;
    }

    neq(operand: any): Query.SqlExpression {
        let w1: Query.SqlExpression = this._createExpr();
        let w2: Query.SqlExpression = this._argExp(operand);
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.NotEqual, w1, w2);
        return expr;
    }

    lt(operand: any): Query.SqlExpression {
        let w1: Query.SqlExpression = this._createExpr();
        let w2: Query.SqlExpression = this._argExp(operand);
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.LessThan, w1, w2);
        return expr;
    }

    gt(operand: any): Query.SqlExpression {
        let w1: Query.SqlExpression = this._createExpr();
        let w2: Query.SqlExpression = this._argExp(operand);
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.GreaterThan, w1, w2);
        return expr;
    }

    lteq(operand: any): Query.SqlExpression {
        let w1: Query.SqlExpression = this._createExpr();
        let w2: Query.SqlExpression = this._argExp(operand);
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.LessThanEqual, w1, w2);
        return expr;
    }

    gteq(operand: any): Query.SqlExpression {
        let w1: Query.SqlExpression = this._createExpr();
        let w2: Query.SqlExpression = this._argExp(operand);
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.GreaterThanEqual, w1, w2);
        return expr;
    }

    in(...operand: any[]): Query.SqlExpression {
        let w1: Query.SqlExpression = this._createExpr();

        let w2: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.Comma);
        for (let i = 0; i < operand.length; i++) {
            w2.exps.push(this._argExp(operand[i]));
        }
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.In, w1, w2);
        return expr;
    }

    between(first: any, second: any): Query.SqlExpression {
        let w1: Query.SqlExpression = this._createExpr();
        let w2: Query.SqlExpression = this._argExp(first);
        let w3: Query.SqlExpression = this._argExp(second);

        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.Between, w1, w2, w3);
        return expr;
    }

    like(operand: any): Query.SqlExpression {
        let w1: Query.SqlExpression = this._createExpr();
        let w2: Query.SqlExpression = this._argExp(operand);
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.Like, w1, w2);
        return expr;
    }

    IsNull(): Query.SqlExpression {
        let w1: Query.SqlExpression = this._createExpr();
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.IsNull, w1);
        return expr;
    }

    IsNotNull(): Query.SqlExpression {
        let w1: Query.SqlExpression = this._createExpr();
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.IsNotNull, w1);
        return expr;
    }

    asc(): Query.SqlExpression {
        let w1: Query.SqlExpression = this._createExpr();
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.Asc, w1);
        return expr;
    }

    desc(): Query.SqlExpression {
        let w1: Query.SqlExpression = this._createExpr();
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.Desc, w1);
        return expr;
    }

    sum(): Query.SqlExpression {
        let w1: Query.SqlExpression = this._createExpr();
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.Sum, w1);
        return expr;
    }

    min(): Query.SqlExpression {
        let w1: Query.SqlExpression = this._createExpr();
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.Min, w1);
        return expr;
    }

    max(): Query.SqlExpression {
        let w1: Query.SqlExpression = this._createExpr();
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.Max, w1);
        return expr;
    }

    count(): Query.SqlExpression {
        let w1: Query.SqlExpression = this._createExpr();
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.Count, w1);
        return expr;
    }

    average(): Query.SqlExpression {
        let w1: Query.SqlExpression = this._createExpr();
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.Average, w1);
        return expr;
    }



}
