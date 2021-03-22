"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LinkSet_1 = require("../collection/LinkSet");
class LinkArrayType {
    constructor(entityType, foreignFunc, earlyLoad) {
        this.linkSet = null;
        this.applied = false;
        this._value = null;
        this.earlyLoad = false;
        this.linkSet = new LinkSet_1.default(entityType, foreignFunc);
        this.earlyLoad = earlyLoad ?? false;
        return new Proxy(this, {
            get(target, prop) {
                if (prop in target) {
                    return target[prop];
                }
                else if (target._value) {
                    return target._value[prop];
                }
            },
            getPrototypeOf() {
                return LinkArrayType.prototype;
            }
        });
    }
    bind(context) {
        this.linkSet.context = context;
        let dbSet = context.dbSetMap.get(this.linkSet.entityType);
        this.linkSet.bind(dbSet);
    }
    async apply(parentObj) {
        this.linkSet.apply(parentObj);
        if (this.earlyLoad) {
            this._value = await this.linkSet.list();
            this.applied = true;
        }
    }
    async get() {
        if (!this.applied) {
            this._value = await this.linkSet.list();
            this.applied = true;
        }
        return this._value;
    }
    toJSON() {
        if (this._value != null) {
            return this._value.valueOf();
        }
        else {
            return null;
        }
    }
}
exports.default = LinkArrayType;
//# sourceMappingURL=LinkArrayType.js.map