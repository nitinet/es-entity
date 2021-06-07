"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require("../sql");
class IQuerySet {
    constructor() {
        this.stat = null;
    }
    innerJoin(coll, param) {
        return this.join(coll, param, sql.Join.InnerJoin);
    }
    leftJoin(coll, param) {
        return this.join(coll, param, sql.Join.LeftJoin);
    }
    rightJoin(coll, param) {
        return this.join(coll, param, sql.Join.RightJoin);
    }
    outerJoin(coll, param) {
        return this.join(coll, param, sql.Join.OuterJoin);
    }
    setStatColumns(tempObj) {
        let tempKeys = Reflect.ownKeys(tempObj);
        tempKeys.forEach(k => {
            let f = tempObj[k];
            if (f instanceof sql.Field) {
                let exp = f.expr();
                this.stat.columns.push(exp);
            }
        });
        return this;
    }
}
exports.default = IQuerySet;
//# sourceMappingURL=IQuerySet.js.map