import Handler from '../handlers/Handler.js';
import * as sql from '../sql/index.js';

export default class Connection {
  private handler: Handler;
  conn: any = null;

  constructor(handler: Handler, conn?: any) {
    this.handler = handler;
    this.conn = conn;
  }

  get Handler() {
    return this.handler;
  }

  async run(query: string | sql.Statement | sql.Statement[]) {
    return this.handler.run(query, this.conn);
  }

  stream(query: string | sql.Statement | sql.Statement[]) {
    return this.handler.stream(query, this.conn);
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
