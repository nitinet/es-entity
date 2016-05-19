import * as Query from "./Query";

export interface IEntityType<T> {
    new (): T;
}

export class Field {
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

    _createExpr(leftOperand: any): Query.SqlExpression[] {
        let w1: Query.SqlExpression = new Query.SqlExpression(this._name);
        let w2: Query.SqlExpression = new Query.SqlExpression("?");
        w2.args = w2.args.concat(leftOperand);

        let res: Query.SqlExpression[] = new Array(w1, w2);
        return res;
    }

    __doubleEqual(operand: any): Query.SqlExpression {
        let res: Query.SqlExpression[] = this._createExpr(operand);
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.Equal, res[0], res[1]);
        return expr;
    }

    __notEqual(operand: any): Query.SqlExpression {
        let res: Query.SqlExpression[] = this._createExpr(operand);
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.NotEqual, res[0], res[1]);
        return expr;
    }

    __lessThan(operand: any): Query.SqlExpression {
        let res: Query.SqlExpression[] = this._createExpr(operand);
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.GreaterThan, res[0], res[1]);
        return expr;
    }

    __greaterThan(operand: any): Query.SqlExpression {
        let res: Query.SqlExpression[] = this._createExpr(operand);
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.LessThan, res[0], res[1]);
        return expr;
    }

    __lessThanEqual(operand: any): Query.SqlExpression {
        let res: Query.SqlExpression[] = this._createExpr(operand);
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.GreaterThanEqual, res[0], res[1]);
        return expr;
    }

    __greaterThanEqual(operand: any): Query.SqlExpression {
        let res: Query.SqlExpression[] = this._createExpr(operand);
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.LessThanEqual, res[0], res[1]);
        return expr;
    }

    __in(operand: any): Query.SqlExpression {
        let res: Query.SqlExpression[] = this._createExpr(operand);
        let expr: Query.SqlExpression = new Query.SqlExpression(null, Query.Operator.In, res[0], res[1]);
        return expr;
    }

}

class ValOperators {
    __doubleEqual(leftOperand: any): Query.SqlExpression | boolean {
        if (leftOperand instanceof Field) {
            return (<Field>leftOperand).__doubleEqual(this);
        } else {
            return leftOperand == this;
        }
    }

    __notEqual(leftOperand: any): Query.SqlExpression | boolean {
        if (leftOperand instanceof Field) {
            return (<Field>leftOperand).__notEqual(this);
        } else {
            return leftOperand != this;
        }
    }

    __lessThan(leftOperand: any): Query.SqlExpression | boolean {
        if (leftOperand instanceof Field) {
            return (<Field>leftOperand).__greaterThan(this);
        } else {
            return leftOperand < this;
        }
    }

    __greaterThan(leftOperand: any): Query.SqlExpression | boolean {
        if (leftOperand instanceof Field) {
            return (<Field>leftOperand).__lessThan(this);
        } else {
            return leftOperand > this;
        }
    }

    __lessThanEqual(leftOperand: any): Query.SqlExpression | boolean {
        if (leftOperand instanceof Field) {
            return (<Field>leftOperand).__greaterThanEqual(this);
        } else {
            return leftOperand == this;
        }
    }

    __greaterThanEqual(leftOperand: any): Query.SqlExpression | boolean {
        if (leftOperand instanceof Field) {
            return (<Field>leftOperand).__lessThanEqual(this);
        } else {
            return leftOperand == this;
        }
    }
}

function applyMixins(derivedCtor: any, ...baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}

// applyMixins(String, ValOperators);
// applyMixins(Number, ValOperators);
// applyMixins(Boolean, ValOperators);
