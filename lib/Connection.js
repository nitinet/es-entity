"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            this.conn = yield this.handler.openConnetion(this.conn);
        });
    }
    initTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.handler.initTransaction(this.conn);
        });
    }
    commit() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.handler.commit(this.conn);
        });
    }
    rollback() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.handler.rollback(this.conn);
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.handler.close(this.conn);
            this.conn = null;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Connection;
