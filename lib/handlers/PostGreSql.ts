// @ts-ignore
import pg from 'pg';
import { Readable } from 'stream';

import * as bean from '../bean/index.js';
import * as sql from '../sql/index.js';
import Handler from './Handler.js';

const pgDriver = await import('pg');
const pgQueryStream = await import('pg-query-stream');

export default class PostgreSql extends Handler {
  connectionPool: pg.Pool;

  constructor(config: bean.IConnectionConfig) {
    super(config);

    this.connectionPool = new pgDriver.Pool({
      user: this.config.username,
      password: this.config.password,
      database: this.config.database,
      host: this.config.host,
      port: this.config.port,
      max: this.config.connectionLimit
    });
  }

  async init() {}

  async getConnection(): Promise<pg.PoolClient> {
    let conn = await this.connectionPool.connect();
    return conn;
  }

  async initTransaction(conn: pg.Client): Promise<void> {
    await conn.query('BEGIN');
  }

  async commit(conn: pg.PoolClient): Promise<void> {
    await conn.query('COMMIT');
  }

  async rollback(conn: pg.PoolClient): Promise<void> {
    await conn.query('ROLLBACK');
  }

  async close(conn: pg.PoolClient): Promise<void> {
    conn.release();
  }

  async end(): Promise<void> {
    /* TODO document why this async method 'end' is empty */
  }

  async run(queryStmt: string | sql.Statement | sql.Statement[], connection?: pg.Client) {
    let { query, dataArgs } = this.prepareQuery(queryStmt);
    query = this.convertPlaceHolder(query);

    let temp: pg.QueryResult<any>;
    if (connection) {
      temp = await connection.query(query, dataArgs);
    } else {
      let con = await this.connectionPool.connect();
      try {
        temp = await con.query(query, dataArgs);
      } finally {
        con.release();
      }
    }

    let result = new bean.ResultSet();
    result.rowCount = temp.rowCount ?? 0;
    result.rows = temp.rows;
    return result;
  }

  async stream(queryStmt: string | sql.Statement | sql.Statement[], connection?: pg.Client) {
    let { query, dataArgs } = this.prepareQuery(queryStmt);
    query = this.convertPlaceHolder(query);

    const queryStream = new pgQueryStream.default(query, dataArgs);
    let stream: Readable;

    if (connection) {
      stream = connection.query(queryStream);
    } else {
      let con = await this.connectionPool.connect();

      stream = con.query(queryStream);
      stream.on('end', () => {
        con.release();
      });
    }
    return stream;
  }

  convertPlaceHolder(query: string) {
    let i = 1;
    while (query.includes('?')) {
      query = query.replace('?', `$${i}`);
      i++;
    }
    return query;
  }

  limit(size: string, index?: string): string {
    return ' limit ' + size + (index ? ' OFFSET ' + index : '');
  }
}
