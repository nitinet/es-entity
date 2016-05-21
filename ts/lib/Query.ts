export enum Operator {
    Equal = 1,
    NotEqual,
    LessThan,
    LessThanEqual,
    GreaterThan,
    GreaterThanEqual,
    And,
    Or,
    Not,
    Plus,
    Minus,
    Multiply,
    Devide,
    Between,
    Exists,
    In,
    Like,
    IsNull,
    IsNotNull,
    Asc,
    Desc,
    Limit,
    Comma,
    Count,
    Sum,
    Min,
    Max,
    Average
}

export abstract class ISqlNode {
    args: Array<any> = new Array<any>();
    abstract eval(): string;
}

/**
 * SqlStatement
 */
export class SqlStatement extends ISqlNode {
    command: string = "";
    columns: Array<ISqlNode> = new Array<ISqlNode>();
    values: Array<SqlExpression> = new Array<SqlExpression>();
    collection: SqlCollection = new SqlCollection();
    where: SqlExpression = new SqlExpression();
    groupBy: Array<SqlExpression> = new Array<SqlExpression>();
    orderBy: Array<SqlExpression> = new Array<SqlExpression>();

    constructor() {
        super();
    }

    eval(): string {
        let result: string = "";

        // Column
        let columnStr: string = "";
        for (let i = 0; i < this.columns.length; i++) {
            let element = this.columns[i];
            let val = element.eval();
            if (i == 0)
                columnStr = columnStr.concat(" " + val);
            else
                columnStr = columnStr.concat(", " + val);
            this.args = this.args.concat(element.args);
        }

        // Collection
        let collectionStr: string = this.collection.eval();
        this.args = this.args.concat(this.collection.args);

        // Where
        let whereStr: string = this.where.eval();
        this.args = this.args.concat(this.where.args);

        // Group By
        let groupByStr: string = "";
        for (let i = 0; i < this.groupBy.length; i++) {
            let element = this.groupBy[i];
            let val = element.eval();
            if (i == 0)
                groupByStr = groupByStr.concat(" " + val);
            else
                groupByStr = groupByStr.concat(", " + val);
            this.args = this.args.concat(element.args);
        }

        // Order By
        let orderByStr: string = "";
        for (let i = 0; i < this.orderBy.length; i++) {
            let element = this.orderBy[i];
            let val = element.eval();
            if (i == 0)
                orderByStr = orderByStr.concat(" " + val);
            else
                orderByStr = orderByStr.concat(", " + val);
            this.args = this.args.concat(element.args);
        }

        // Values
        let valueStr: string = "";
        for (let i = 0; i < this.values.length; i++) {
            let element = this.values[i];
            let val = element.eval();
            if (i == 0)
                valueStr = valueStr.concat(" " + val);
            else
                valueStr = valueStr.concat(", " + val);
            this.args = this.args.concat(element.args);
        }

        this.command = this.command.toLowerCase();
        if (this.command === "insert") {
            result = result.concat("insert into ", collectionStr, "(", columnStr, ") values (", valueStr, ")");
        } else if (this.command == "select") {
            result = result.concat("select", columnStr, " from ", collectionStr);
            if (whereStr)
                result = result.concat(" where ", whereStr);
            if (groupByStr)
                result = result.concat(" group by ", groupByStr);
            if (orderByStr)
                result = result.concat(" order by ", orderByStr);
        } else if (this.command === "update") {
            result = result.concat("update ", collectionStr, " set ", columnStr, " where ", whereStr);
        } else if (this.command === "delete") {
            result = result.concat("delete from ", collectionStr, " where ", whereStr);
        }
        return result;
    }
}

/**
 * SqlCollection
 * Used for tables and columns
 */
export class SqlCollection extends ISqlNode {
    colAlias: string = null;
    value: string = null;
    stat: SqlStatement = null;
    alias: string = null;

    constructor() {
        super()
    }

    eval(): string {
        let result: string = "";
        if (this.value)
            result = this.colAlias ? this.colAlias + "." + this.value : this.value;
        else if (this.stat) {
            this.args = this.args.concat(this.stat.args);
            result = "(" + this.stat.eval() + ")";
        }
        if (!result) {
            throw "No Collection Found";
        }
        if (this.alias)
            result = result.concat(" as ", this.alias);
        return result;
    }
}

export interface Column {
    // Comparison Operators
    eq(operand: any): SqlExpression;
    neq(operand: any): SqlExpression;
    lt(operand: any): SqlExpression;
    gt(operand: any): SqlExpression;
    lteq(operand: any): SqlExpression;
    gteq(operand: any): SqlExpression;

    // Logical Operators
    and(operand: Column): SqlExpression;
    or(operand: Column): SqlExpression;
    not(): SqlExpression;

    // Inclusion Funtions
    in(...operand: any[]): SqlExpression;
    between(first: any, second: any): SqlExpression;
    like(operand: any): SqlExpression;
    IsNull(): SqlExpression;
    IsNotNull(): SqlExpression;

    // Arithmatic Operators
    plus(operand: any): SqlExpression;
    minus(operand: any): SqlExpression;
    multiply(operand: any): SqlExpression;
    devide(operand: any): SqlExpression;

    // Sorting Operators
    asc(): SqlExpression;
    desc(): SqlExpression;

    // Group Functions
    sum(): SqlExpression;
    min(): SqlExpression;
    max(): SqlExpression;
    count(): SqlExpression;
    average(): SqlExpression;
}

/**
 * SqlExpression
 */
export class SqlExpression extends ISqlNode implements Column {
    value: string = null;
    exps: Array<SqlExpression> = null;
    operator: Operator = null;

    add(...expressions: Array<SqlExpression>): SqlExpression {
        this.exps = this.exps.concat(expressions);
        return this;
    }

    constructor(value?: string, operator?: Operator, ...expressions: Array<SqlExpression>) {
        super()
        this.value = value;
        this.exps = expressions;
        this.operator = operator;
    }

    eval(): string {
        if (this.value) {
            return this.value;
        } else if (this.exps) {
            let values: Array<string> = new Array<string>();
            for (let i = 0; i < this.exps.length; i++) {
                values[i] = this.exps[i].eval();
                this.args = this.args.concat(this.exps[i].args);
            }

            if (!this.operator && this.exps.length > 1) {
                this.operator = Operator.And;
            }

            let val0: string = values[0] ? values[0] : "";
            let val1: string = values[1] ? values[1] : "";

            let r: string = "";
            switch (this.operator) {
                case Operator.Equal:
                    r = val0 + " = " + val1;
                    break;
                case Operator.NotEqual:
                    r = val0 + " != " + val1;
                    break;
                case Operator.LessThan:
                    r = val0 + " < " + val1;
                    break;
                case Operator.LessThanEqual:
                    r = val0 + " <= " + val1;
                    break;
                case Operator.GreaterThan:
                    r = val0 + " > " + val1;
                    break;
                case Operator.GreaterThanEqual:
                    r = val0 + " >= " + val1;
                    break;
                case Operator.And:
                    r = "(" + val0;
                    for (let i = 1; i < values.length; i++)
                        r = r + ") and (" + values[i];
                    r = r + ")";
                    break;
                case Operator.Or:
                    r = "(" + val0;
                    for (let i = 1; i < values.length; i++)
                        r = r + ") or (" + values[i];
                    r = r + ")";
                    break;
                case Operator.Not:
                    r = " not " + val0;
                    break;
                case Operator.Between:
                    r = val0 + " between " + val1 + " and " + values[2];
                    break;
                case Operator.Exists:
                    r = " exists (" + val0 + ")";
                    break;
                case Operator.In:
                    r = val0 + " in (" + val1 + ")";
                    break;
                case Operator.Like:
                    r = val0 + " like " + val1;
                    break;
                case Operator.IsNull:
                    r = val0 + " is null";
                    break;
                case Operator.IsNotNull:
                    r = val0 + " is not null";
                    break;
                case Operator.Asc:
                    r = val0 + " asc";
                    break;
                case Operator.Desc:
                    r = val0 + " desc";
                    break;
                case Operator.Limit: {
                    r = "limit " + val0 + (val1 ? "," + val1 : "");
                }
                    break;
                case Operator.Comma: {
                    for (let i = 0; i < values.length; i++)
                        r = r.concat(values[i], ", ");
                    r = r.slice(0, r.length - 2);
                }
                    break;

                default:
                    break;
            }
            return r;
        }
    }

    // Column Interface functions
    // Comparison Operators
    eq(operand: any): SqlExpression {
        return null;
    }
    neq(operand: any): SqlExpression {
        return null;
    }
    lt(operand: any): SqlExpression {
        return null;
    }
    gt(operand: any): SqlExpression {
        return null;
    }
    lteq(operand: any): SqlExpression {
        return null;
    }
    gteq(operand: any): SqlExpression {
        return null;
    }

    // Logical Operators
    and(operand: SqlExpression): SqlExpression {
        let expr: SqlExpression = new SqlExpression(null, Operator.And, this, operand);
        return expr;
    }
    or(operand: SqlExpression): SqlExpression {
        let expr: SqlExpression = new SqlExpression(null, Operator.Or, this, operand);
        return expr;
    }
    not(): SqlExpression {
        let expr: SqlExpression = new SqlExpression(null, Operator.Not, this);
        return expr;
    }

    // Inclusion Funtions
    in(...operand: any[]): SqlExpression {
        return null;
    }
    between(first: any, second: any): SqlExpression {
        return null;
    }
    like(operand: any): SqlExpression {
        return null;
    }
    IsNull(): SqlExpression {
        return null;
    }
    IsNotNull(): SqlExpression {
        return null;
    }

    // Arithmatic Operators
    plus(operand: any): SqlExpression {
        return null;
    }
    minus(operand: any): SqlExpression {
        return null;
    }
    multiply(operand: any): SqlExpression {
        return null;
    }
    devide(operand: any): SqlExpression {
        return null;
    }

    // Sorting Operators
    asc(): SqlExpression {
        return null;
    }
    desc(): SqlExpression {
        return null;
    }

    // Group Functions
    sum(): SqlExpression {
        return null;
    }
    min(): SqlExpression {
        return null;
    }
    max(): SqlExpression {
        return null;
    }
    count(): SqlExpression {
        return null;
    }
    average(): SqlExpression {
        return null;
    }

}
