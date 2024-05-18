// @ts-ignore
import oracledb from 'oracledb';
import { Readable } from 'stream';
import * as bean from '../bean/index.js';
import * as sql from '../sql/index.js';
import Handler from './Handler.js';

const oracledbDriver = await import('oracledb');

export default class Oracle extends Handler {
  connectionPool!: oracledb.Pool;

  async init() {
    this.connectionPool = await oracledbDriver.createPool({
      user: this.config.username,
      password: this.config.password,
      connectString: `${this.config.host}:${this.config.port}/${this.config.database}`
    });
  }

  async getConnection(): Promise<oracledb.Connection> {
    let conn = await this.connectionPool.getConnection();
    // let conn = await this.driver.getConnection({
    // 	user: this.config.username,
    // 	password: this.config.password,
    // 	connectString: `${this.config.host}:${this.config.port}/${this.config.database}`
    // });
    return conn;
  }

  async initTransaction(conn: oracledb.Connection): Promise<void> {}
  async commit(conn: oracledb.Connection): Promise<void> {
    return conn.commit();
  }
  async rollback(conn: oracledb.Connection): Promise<void> {
    return conn.rollback();
  }
  async close(conn: oracledb.Connection): Promise<void> {
    return conn.close();
  }
  async end(): Promise<void> {}

  async run(queryStmt: string | sql.Statement | sql.Statement[], connection?: oracledb.Connection) {
    let { query, dataArgs } = this.prepareQuery(queryStmt);

    let temp: oracledb.Result<any>;
    if (connection) {
      temp = await connection.execute(query, dataArgs);
    } else {
      let conn = await this.connectionPool.getConnection();
      try {
        temp = await conn.execute(query, dataArgs);
      } finally {
        conn.close();
      }
    }

    let result = new bean.ResultSet();
    result.rows = temp.rows ?? [];
    result.rowCount = temp.rowsAffected ?? 0;
    return result;
  }

  async stream(queryStmt: string | sql.Statement | sql.Statement[], connection?: oracledb.Connection) {
    let { query, dataArgs } = this.prepareQuery(queryStmt);

    let stream: Readable;
    if (connection) {
      stream = connection.queryStream(query, dataArgs);
    } else {
      let conn = await this.connectionPool.getConnection();

      stream = conn.queryStream(query, dataArgs);
      stream.on('end', function () {
        stream.destroy();
      });
      stream.on('close', function () {
        conn.close();
      });
    }
    return stream;
  }
}
