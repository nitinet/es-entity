// @ts-ignore
import sqlite from 'sqlite3';
import * as bean from '../bean/index.js';
import * as sql from '../sql/index.js';
import Handler from './Handler.js';
import stream from 'stream';

const sqliteDriver = await import('sqlite3');

export default class SQlite extends Handler {
  connectionPool!: sqlite.Database;

  async init() {
    this.connectionPool = await new Promise((res, rej) => {
      let temp = new sqliteDriver.Database(this.config.database, err => {
        if (err) rej(err);
      });
      res(temp);
    });
  }

  async getConnection() {
    return this.connectionPool;
  }

  async initTransaction(conn: sqlite.Database): Promise<void> {
    await new Promise((res, rej) => {
      conn.run('BEGIN TRANSACTION', (data: any, err: any) => {
        if (err) rej(err);
        else res(data);
      });
    });
  }

  async commit(conn: sqlite.Database): Promise<void> {
    await new Promise((res, rej) => {
      conn.run('COMMIT', (data: any, err: any) => {
        if (err) rej(err);
        else res(data);
      });
    });
  }

  async rollback(conn: sqlite.Database): Promise<void> {
    await new Promise((res, rej) => {
      conn.run('ROLLBACK', (data: any, err: any) => {
        if (err) rej(err);
        else res(data);
      });
    });
  }

  async close(conn: sqlite.Database): Promise<void> {
    // await new Promise<void>((res, rej) => {
    // 	conn.close((err: any) => {
    // 		if (err) rej(err);
    // 		else res();
    // 	});
    // });
  }

  async end(): Promise<void> {}

  async run(queryStmt: string | sql.Statement | sql.Statement[], connection?: sqlite.Database) {
    let { query, dataArgs } = this.prepareQuery(queryStmt);
    let conn = connection ?? this.connectionPool;

    let data: any[] = await new Promise((resolve, reject) => {
      conn.all(query, dataArgs, function (err, r) {
        if (err) {
          reject(err);
        } else {
          resolve(r);
        }
      });
    });

    let result = new bean.ResultSet();
    result.rows = data;
    result.rowCount = data.length;
    return result;
  }

  async stream(queryStmt: string | sql.Statement | sql.Statement[], connection?: sqlite.Database) {
    let { query, dataArgs } = this.prepareQuery(queryStmt);
    let conn = connection ?? this.connectionPool;

    let dataStream = new stream.Duplex();
    conn.each(
      query,
      dataArgs,
      (err, row: any) => {
        if (err) throw err;
        dataStream.write(row);
      },
      (err, count) => {
        if (err) throw err;
        dataStream.write(null);
      }
    );
    return dataStream;
  }
}
