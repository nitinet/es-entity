export interface ISqlNode {
    eval(): Promise<string>;
}

/**
 * SqlStatement
 */
export class SqlStatement implements ISqlNode {
    _command: string = "";
    _columns: Array<SqlCollection> = new Array<SqlCollection>();
    _collection: SqlCollection = new SqlCollection();
    _where: SqlExpression = new SqlExpression();
    _groupBy: Array<SqlExpression> = new Array<SqlExpression>();
    _orderBy: Array<SqlExpression> = new Array<SqlExpression>();

    constructor() {
    }

    get command(): string {
        return this._command;
    }

    set command(val: string) {
        this._command = val;
    }

    get columns(): Array<SqlCollection> {
        return this._columns;
    }

    set columns(val: Array<SqlCollection>) {
        this._columns = val;
    }

    get collection(): SqlCollection {
        return this._collection;
    }

    set collection(val: SqlCollection) {
        this._collection = val;
    }

    get where(): SqlExpression {
        return this._where;
    }

    set where(val: SqlExpression) {
        this._where = val;
    }

    get groupBy(): Array<SqlExpression> {
        return this._groupBy;
    }

    set groupBy(val: Array<SqlExpression>) {
        this._groupBy = val;
    }

    get orderBy(): Array<SqlExpression> {
        return this._orderBy;
    }

    set orderBy(val: Array<SqlExpression>) {
        this._orderBy = val;
    }

    eval(): Promise<string> {
        let p: Promise<string> = new Promise<string>((resolve) => {
            let result: string = "";
            let promises: Array<Promise<string>> = new Array<Promise<string>>();

            // Column Promises
            let columnStrArr: Array<string> = new Array();
            for (let i = 0; i < this._columns.length; i++) {
                let element = this._columns[i];
                let p1: Promise<string> = element.eval();
                p1.then((val) => {
                    columnStrArr[i] = val;
                });
                promises.push(p1);
            }

            // Collection Promise
            let collectionStr: string = "";
            let p2: Promise<string> = this._collection.eval();
            p2.then((val) => {
                collectionStr = val;
            });
            promises.push(p2);

            // Where promise
            let whereStr: string = "";
            let p3: Promise<string> = this._where.eval();
            p3.then((val) => {
                whereStr = val;
            });
            promises.push(p3);

            // Group By Promises
            let groupByStrArr: Array<string> = new Array();
            for (let i = 0; i < this._groupBy.length; i++) {
                let element = this._groupBy[i];
                let p4: Promise<string> = element.eval();
                p4.then((val) => {
                    groupByStrArr[i] = val;
                });
                promises.push(p4);
            }

            // Order By Promises
            let orderByStrArr: Array<string> = new Array();
            for (let i = 0; i < this._orderBy.length; i++) {
                let element = this._orderBy[i];
                let p5: Promise<string> = element.eval();
                p5.then((val) => {
                    orderByStrArr[i] = val;
                });
                promises.push(p5);
            }

            Promise.all<string>(promises).then(() => {
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

                this._command = this._command.toLowerCase();
                if (this._command === "insert") {
                    result.concat("insert into ", collectionStr, " values (", columnStr, ")");
                } else if (this._command == "select") {
                    result.concat("select", columnStr, " from ", collectionStr, " where ", whereStr, " group by ", groupByStr, " order by ", orderByStr);
                } else if (this._command === "update") {
                    result.concat("update ", collectionStr, " set ", columnStr, " where ", whereStr);
                } else if (this._command === "delete") {
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
    _value: string | SqlStatement | SqlExpression = null;
    _alias: string = null;

    constructor() {
    }

    get value(): string | SqlStatement | SqlExpression {
        return this._value;
    }

    set value(val: string | SqlStatement | SqlExpression) {
        this._value = val;
    }

    get alias(): string {
        return this._alias;
    }

    set alias(val: string) {
        this._alias = val;
    }

    eval(): Promise<string> {
        let p: Promise<string> = new Promise<string>((resolve, reject) => {
            if (!this._value) {
                reject();
            } else if (typeof this._value === "string")
                resolve(<string>this._value);
            else if ((this._value instanceof SqlStatement) || (this._value instanceof SqlExpression)) {
                resolve("(" + (<SqlStatement | SqlExpression>this._value).eval() + ")");
            }
        }).then<string>((val): string => {
            if (this._alias)
                val = val + " as " + this._alias;
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
    Limit
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
            } else if (typeof this._exps === "string")
                resolve(<string>this._exps);
            else if (this._exps instanceof SqlExpression) {
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
                        case SqlOperator.In: {
                            r = val0 + " in [";
                            for (let i = 1; i < values.length; i++)
                                r = r + values[i] + ", ";
                            r = r.slice(0, r.length - 2) + "]";
                        }
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
