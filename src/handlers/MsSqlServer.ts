// @ts-ignore
import mssql from 'mssql';
import { Readable } from 'stream';
import * as bean from '../bean/index.js';
import * as sql from '../sql/index.js';
import Handler from './Handler.js';

const mssqlDriver = await import('mssql');

export default class MsSqlServer extends Handler {
  connectionPool: mssql.ConnectionPool;

  constructor(config: bean.IConnectionConfig) {
    super(config);

    this.connectionPool = new mssqlDriver.ConnectionPool({
      server: this.config.host,
      port: this.config.port,
      user: this.config.username,
      password: this.config.password,
      database: this.config.database
    });
  }

  async init() {
    await this.connectionPool.connect();
  }

  async getConnection(): Promise<mssql.Request> {
    await mssqlDriver.connect({
      server: this.config.host,
      port: this.config.port,
      user: this.config.username,
      password: this.config.password,
      database: this.config.database
    });
    return new mssqlDriver.Request();
  }

  async initTransaction(conn: mssql.Request): Promise<void> {}
  async commit(conn: mssql.Request): Promise<void> {}
  async rollback(conn: mssql.Request): Promise<void> {}
  async close(conn: mssql.Request): Promise<void> {}
  async end(): Promise<void> {}

  async run(queryStmt: string | sql.Statement | sql.Statement[], connection?: mssql.Request) {
    let { query, dataArgs } = this.prepareQuery(queryStmt);
    let conn = connection ?? this.connectionPool.request();

    let data = await conn.query(query);

    let result: bean.ResultSet = new bean.ResultSet();
    result.rowCount = data.rowsAffected[0] ?? 0;
    result.rows = data.recordset;
    return result;
  }

  async stream(queryStmt: string | sql.Statement | sql.Statement[], connection?: mssql.Request) {
    let { query, dataArgs } = this.prepareQuery(queryStmt);
    let conn = connection ?? this.connectionPool.request();
    conn.stream = true;

    conn.query(query);
    return conn.toReadableStream();
  }
}
