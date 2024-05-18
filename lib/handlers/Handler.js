import * as sql from '../sql/index.js';
export default class Handler {
    config;
    constructor(config) {
        this.config = config;
    }
    prepareQuery(queryStmt) {
        let query;
        let dataArgs = [];
        if (Array.isArray(queryStmt)) {
            let tempQueries = [];
            queryStmt.forEach(a => {
                if (!(a instanceof sql.Statement))
                    throw new Error('Invalid Statement');
                tempQueries.push(a.eval(this));
                dataArgs.push(...a.args);
            });
            query = tempQueries.join('; ').concat(';');
        }
        else if (queryStmt instanceof sql.Statement) {
            query = queryStmt.eval(this);
            dataArgs.push(...queryStmt.args);
        }
        else {
            query = queryStmt;
        }
        return { query, dataArgs };
    }
    eq(val0, val1) {
        return `${val0} = ${val1}`;
    }
    neq(val0, val1) {
        return `${val0} != ${val1}`;
    }
    lt(val0, val1) {
        return `${val0} < ${val1}`;
    }
    gt(val0, val1) {
        return `${val0} > ${val1}`;
    }
    lteq(val0, val1) {
        return `${val0} <= ${val1}`;
    }
    gteq(val0, val1) {
        return `${val0} >= ${val1}`;
    }
    and(values) {
        return values
            .filter(x => x)
            .map(val => {
            return `(${val})`;
        })
            .join(' and ');
    }
    or(values) {
        return values
            .filter(x => x)
            .map(val => {
            return `(${val})`;
        })
            .join(' or ');
    }
    not(val0) {
        return ` not ${val0}`;
    }
    in(values) {
        let lhs = values[0];
        let rhs = values.slice(1).join(', ');
        return `${lhs} in (${rhs})`;
    }
    between(val0, val1, val2) {
        return `${val0} between ${val1} and ${val2}`;
    }
    like(val0, val1) {
        return `${val0} like ${val1}`;
    }
    isNull(val0) {
        return `${val0} is null`;
    }
    isNotNull(val0) {
        return `${val0} is not null`;
    }
    exists(val0) {
        return ` exists (${val0})`;
    }
    limit(size, index) {
        let indexStr = index ? `${index}, ` : '';
        return ` limit ${indexStr}${size}`;
    }
    plus(val0, val1) {
        return `${val0} + ${val1}`;
    }
    minus(val0, val1) {
        return `${val0} - ${val1}`;
    }
    multiply(val0, val1) {
        return `${val0} * ${val1}`;
    }
    devide(val0, val1) {
        return `${val0} / ${val1}`;
    }
    asc(val0) {
        return `${val0} asc`;
    }
    desc(val0) {
        return `${val0} desc`;
    }
    sum(val0) {
        return `sum(${val0})`;
    }
    min(val0) {
        return `min(${val0})`;
    }
    max(val0) {
        return `max(${val0})`;
    }
    count(val0) {
        return `count(${val0})`;
    }
    average(val0) {
        return `avg(${val0})`;
    }
}
//# sourceMappingURL=Handler.js.map