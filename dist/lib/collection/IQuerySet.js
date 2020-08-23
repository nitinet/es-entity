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
}
exports.default = IQuerySet;
//# sourceMappingURL=IQuerySet.js.map