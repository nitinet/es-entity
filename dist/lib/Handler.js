"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Handler {
    constructor() {
        this.context = null;
    }
    async getTableInfo(tableName) { return null; }
    async run(query, args, connetction) { return null; }
    convertPlaceHolder(query) { return query; }
    insertQuery(collection, columns, values) { return `insert into ${collection} (${columns}) values (${values})`; }
    selectQuery(collection, columns) { return `select ${columns} from ${collection}`; }
    whereQuery(where) { return ` where ${where}`; }
    groupQuery(groupBy) { return ` group by ${groupBy}`; }
    orderQuery(orderBy) { return ` order by ${orderBy}`; }
    updateQuery(collection, columns, wheres) { return `update ${collection} set ${columns} where ${wheres}`; }
    deleteQuery(collection, where) { return `delete from ${collection} where ${where}`; }
    eq(val0, val1) { return val0 + ' = ' + val1; }
    neq(val0, val1) { return val0 + ' != ' + val1; }
    lt(val0, val1) { return val0 + ' < ' + val1; }
    gt(val0, val1) { return val0 + ' > ' + val1; }
    lteq(val0, val1) { return val0 + ' <= ' + val1; }
    gteq(val0, val1) { return val0 + ' >= ' + val1; }
    and(values) {
        let r = '(' + values[0];
        for (let i = 1; i < values.length; i++) {
            r = r + ') and (' + values[i];
        }
        r = r + ')';
        return r;
    }
    or(values) {
        let r = '(' + values[0];
        for (let i = 1; i < values.length; i++) {
            r = r + ') or (' + values[i];
        }
        r = r + ')';
        return r;
    }
    not(val0) { return ' not ' + val0; }
    in(val0, val1) { return val0 + ' in (' + val1 + ')'; }
    between(values) { return values[0] + ' between ' + values[1] + ' and ' + values[2]; }
    like(val0, val1) { return val0 + ' like ' + val1; }
    isNull(val0) { return val0 + ' is null'; }
    isNotNull(val0) { return val0 + ' is not null'; }
    exists(val0) { return ' exists (' + val0 + ')'; }
    limit(val0, val1) { return ' limit ' + val0 + (val1 ? ',' + val1 : ''); }
    plus(val0, val1) { return val0 + ' + ' + val1; }
    minus(val0, val1) { return val0 + ' - ' + val1; }
    multiply(val0, val1) { return val0 + ' * ' + val1; }
    devide(val0, val1) { return val0 + ' / ' + val1; }
    asc(val0) { return val0 + ' asc'; }
    desc(val0) { return val0 + ' desc'; }
    sum(val0) { return 'sum(' + val0 + ')'; }
    min(val0) { return 'min(' + val0 + ')'; }
    max(val0) { return 'max(' + val0 + ')'; }
    count(val0) { return 'count(' + val0 + ')'; }
    average(val0) { return 'avg(' + val0 + ')'; }
}
exports.default = Handler;
