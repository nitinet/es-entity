"use strict";
class Connection {
    constructor(handler, conn) {
        this.handler = null;
        this.conn = null;
        this.handler = handler;
        this.conn = conn;
    }
    get Handler() {
        return this.handler;
    }
    async open() {
        this.conn = await this.handler.openConnetion(this.conn);
    }
    async initTransaction() {
        await this.handler.initTransaction(this.conn);
    }
    async commit() {
        await this.handler.commit(this.conn);
    }
    async rollback() {
        await this.handler.rollback(this.conn);
    }
    async close() {
        await this.handler.close(this.conn);
        this.conn = null;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Connection;
