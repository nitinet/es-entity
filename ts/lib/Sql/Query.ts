export interface ISqlNode {
    eval(): Promise<string>;
}

/**
 * SqlStatement
 */
export class SqlStatement implements ISqlNode {
    command: string = "";
    columns: Array<SqlCollection | SqlExpression> = new Array<SqlCollection | SqlExpression>();
    values: Array<SqlExpression> = new Array<SqlExpression>();
    collection: SqlCollection = new SqlCollection();
    where: SqlExpression = new SqlExpression();
    groupBy: Array<SqlExpression> = new Array<SqlExpression>();
    orderBy: Array<SqlExpression> = new Array<SqlExpression>();

    constructor() {
    }

    eval(): Promise<string> {
        let p: Promise<string> = new Promise<string>((resolve) => {
            let result: string = "";
            let promises: Array<Promise<void>> = new Array<Promise<void>>();

            // Column Promises
            let columnStrArr: Array<string> = new Array();
            for (let i = 0; i < this.columns.length; i++) {
                let element = this.columns[i];
                let p1 = element.eval().then((val) => {
                    columnStrArr[i] = val;
                });
                promises.push(p1);
            }

            // Collection Promise
            let collectionStr: string = "";
            let p2 = this.collection.eval().then((val) => {
                collectionStr = val;
            });
            promises.push(p2);

            // Where promise
            let whereStr: string = "";
            let p3 = this.where.eval().then((val) => {
                whereStr = val;
            });
            promises.push(p3);

            // Group By Promises
            let groupByStrArr: Array<string> = new Array();
            for (let i = 0; i < this.groupBy.length; i++) {
                let element = this.groupBy[i];
                let p4 = element.eval().then((val) => {
                    groupByStrArr[i] = val;
                });
                promises.push(p4);
            }

            // Order By Promises
            let orderByStrArr: Array<string> = new Array();
            for (let i = 0; i < this.orderBy.length; i++) {
                let element = this.orderBy[i];
                let p5 = element.eval().then((val) => {
                    orderByStrArr[i] = val;
                });
                promises.push(p5);
            }

            // Column Promises
            let valueStrArr: Array<string> = new Array();
            for (let i = 0; i < this.values.length; i++) {
                let element = this.values[i];
                let p6 = element.eval().then((val) => {
                    valueStrArr[i] = val;
                });
                promises.push(p6);
            }

            Promise.all(promises).then(() => {
                let columnStr: string = "";
                for (let i = 0; i < columnStrArr.length; i++) {
                    let element = columnStrArr[i];
                    if (i == 0)
                        columnStr.concat(" " + element);
                    else
                        columnStr.concat(", " + element);
                }

                let groupByStr: string = "";
                for (let i = 0; i < groupByStrArr.length; i++) {
                    let element = groupByStrArr[i];
                    if (i == 0)
                        groupByStr.concat(" " + element);
                    else
                        groupByStr.concat(", " + element);
                }

                let orderByStr: string = "";
                for (let i = 0; i < orderByStrArr.length; i++) {
                    let element = orderByStrArr[i];
                    if (i == 0)
                        orderByStr.concat(" " + element);
                    else
                        orderByStr.concat(", " + element);
                }

                let valueStr: string = "";
                for (let i = 0; i < valueStrArr.length; i++) {
                    let element = valueStrArr[i];
                    if (i == 0)
                        valueStr.concat(" " + element);
                    else
                        valueStr.concat(", " + element);
                }

                this.command = this.command.toLowerCase();
                if (this.command === "insert") {
                    result.concat("insert into ", collectionStr, "(", columnStr, ") values (", valueStr, ")");
                } else if (this.command == "select") {
                    result.concat("select", columnStr, " from ", collectionStr, " where ", whereStr, " group by ", groupByStr, " order by ", orderByStr);
                } else if (this.command === "update") {
                    result.concat("update ", collectionStr, " set ", columnStr, " where ", whereStr);
                } else if (this.command === "delete") {
                    result.concat("delete from ", collectionStr, " where ", whereStr);
                }
                resolve(result);
            });
        });
        return p;
    }
}

/**
 * SqlCollection
 * Used for tables and columns
 */
export class SqlCollection implements ISqlNode {
    value: string | SqlStatement = null;
    alias: string = null;

    constructor() {
    }

    eval(): Promise<string> {
        let p: Promise<string> = new Promise<string>((resolve, reject) => {
            if (!this.value) {
                reject();
            } else if (typeof this.value === "string")
                resolve(<string>this.value);
            else if (this.value instanceof SqlStatement) {
                resolve("(" + (<SqlStatement>this.value).eval() + ")");
            }
        }).then<string>((val): string => {
            if (this.alias)
                val = val + " as " + this.alias;
            return val;
        });
        return p;
    }
}

export enum SqlOperator {
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

/**
 * SqlExpression
 */
export class SqlExpression implements ISqlNode {
    _exps: string | SqlExpression | Array<SqlExpression | string> = null;
    _operator: SqlOperator = null;


    constructor(operator?: SqlOperator, ...expressions: Array<SqlExpression | string>) {
        this._exps = expressions;
        this._operator = operator;
    }

    get exps(): string | SqlExpression | Array<SqlExpression | string> {
        return this._exps;
    }

    set exps(val: string | SqlExpression | Array<SqlExpression | string>) {
        this._exps = val;
    }

    get operator(): SqlOperator {
        return this._operator;
    }

    set operator(val: SqlOperator) {
        this._operator = val;
    }

    eval(): Promise<string> {
        let p: Promise<string> = new Promise<string>((resolve) => {
            if (!this._exps) {
                resolve();
            } else if (typeof this._exps === "string") {
                resolve(<string>this._exps);
            } else if (this._exps instanceof SqlExpression) {
                resolve((<SqlExpression>this._exps).eval());
            } else if (Array.isArray(this._exps)) {
                let promises: Array<Promise<string>> = new Array<Promise<string>>();

                let temp: Array<SqlExpression | string> = <Array<SqlExpression | string>>this._exps;
                for (let i = 0; i < temp.length; i++) {
                    let p: Promise<string> = new Promise<string>((res) => {
                        if (!temp[i]) {
                            res();
                        } else if (typeof temp[i] === "string")
                            res(<string>temp[i]);
                        else if (temp[i] instanceof SqlExpression) {
                            res((<SqlExpression>temp[i]).eval());
                        }
                    });
                    promises.push(p);
                }

                Promise.all<string>(promises).then((values: string[]) => {
                    let val0: string = values[0] ? values[0] : "";
                    let val1: string = values[1] ? values[1] : "";

                    let r: string = "";
                    switch (this._operator) {
                        case SqlOperator.Equal:
                            r = val0 + " = " + val1;
                            break;
                        case SqlOperator.NotEqual:
                            r = val0 + " != " + val1;
                            break;
                        case SqlOperator.LessThan:
                            r = val0 + " < " + val1;
                            break;
                        case SqlOperator.LessThanEqual:
                            r = val0 + " <= " + val1;
                            break;
                        case SqlOperator.GreaterThan:
                            r = val0 + " > " + val1;
                            break;
                        case SqlOperator.GreaterThanEqual:
                            r = val0 + " >= " + val1;
                            break;
                        case SqlOperator.And:
                            r = "(" + val0;
                            for (let i = 1; i < values.length; i++)
                                r = r + ") and (" + values[i];
                            r = r + ")";
                            break;
                        case SqlOperator.Or:
                            r = "(" + val0;
                            for (let i = 1; i < values.length; i++)
                                r = r + ") or (" + values[i];
                            r = r + ")";
                            break;
                        case SqlOperator.Not:
                            r = " not " + val0;
                            break;
                        case SqlOperator.Between:
                            r = val0 + " between " + val1 + " and " + values[2];
                            break;
                        case SqlOperator.Exists:
                            r = " exists (" + val0 + ")";
                            break;
                        case SqlOperator.In:
                            r = val0 + " in (" + val1 + ")";
                            break;
                        case SqlOperator.Like:
                            r = val0 + " like " + val1;
                            break;
                        case SqlOperator.IsNull:
                            r = val0 + " is null";
                            break;
                        case SqlOperator.IsNotNull:
                            r = val0 + " is not null";
                            break;
                        case SqlOperator.Asc:
                            r = val0 + " asc";
                            break;
                        case SqlOperator.Desc:
                            r = val0 + " desc";
                            break;
                        case SqlOperator.Limit: {
                            r = "limit " + val0 + (val1 ? "," + val1 : "");
                        }
                            break;
                        case SqlOperator.Comma: {
                            for (let i = 0; i < values.length; i++)
                                r.concat(r, values[i], ", ");
                            r = r.slice(0, r.length - 2);
                        }
                            break;

                        default:
                            break;
                    }
                    resolve(r);
                });
            }
        });
        return p;
    }
}
