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
    Between,
    Exists,
    In,
    Like,
    IsNull,
    IsNotNull,
    Asc,
    Desc,
    Limit,
    Comma
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
    value: string = null;
    stat: SqlStatement = null;
    alias: string = null;

    constructor() {
        super()
    }

    eval(): string {
        let result: string = "";
        if (!this.value) {
            throw "No Collection Found";
        } else if (this.value)
            result = this.value;
        else if (this.stat) {
            this.args = this.args.concat(this.stat.args);
            result = "(" + this.stat.eval() + ")";
        }
        if (this.alias)
            result = result + " as " + this.alias;
        return result;
    }
}

/**
 * SqlExpression
 */
export class SqlExpression extends ISqlNode {
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
                this.args = this.args.concat(this.exps[i].args);
                values[i] = this.exps[i].eval();
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
                        r = r.concat(r, values[i], ", ");
                    r = r.slice(0, r.length - 2);
                }
                    break;

                default:
                    break;
            }
            return r;
        }
    }
}