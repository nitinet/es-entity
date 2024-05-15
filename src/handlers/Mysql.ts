// @ts-ignore
import mysql from 'mysql';
import * as bean from '../bean/index.js';
import * as sql from '../sql/index.js';
import Handler from './Handler.js';
import { Readable } from 'stream';

const mysqlDriver = await import('mysql');

// let typeCast: mysql.TypeCast = function (field: mysql.UntypedFieldInfo & {
// 	type: string;
// 	string(): null | string;
// 	buffer(): null | Buffer;
// 	geometry(): null | mysql.GeometryType;
// }, next: () => void) {
// 	if (field.type === 'TINY' && field.length === 1) {
// 		return (field.string() === '1');
// 	} else if (field.type === 'JSON') {
// 		let data = field.string();
// 		return null != data ? JSON.parse(data) : null;
// 	} else {
// 		return next();
// 	}
// }

export default class Mysql extends Handler {
  connectionPool: mysql.Pool;

  constructor(config: bean.IConnectionConfig) {
    super(config);

    this.connectionPool = mysqlDriver.createPool({
      connectionLimit: this.config.connectionLimit,
      host: this.config.host,
      port: this.config.port,
      user: this.config.username,
      password: this.config.password,
      database: this.config.database
    });
  }

  async init() {}

  getConnection(): Promise<mysql.PoolConnection> {
    return new Promise<mysql.PoolConnection>((res, rej) => {
      this.connectionPool.getConnection((err: mysql.MysqlError, c: mysql.PoolConnection) => {
        if (err) rej(err);
        else res(c);
      });
    });
  }

  initTransaction(conn: mysql.PoolConnection) {
    return new Promise<void>((resolve, reject) => {
      conn.beginTransaction((err: mysql.MysqlError) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  commit(conn: mysql.PoolConnection) {
    return new Promise<void>((resolve, reject) => {
      conn.commit((err: mysql.MysqlError) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  rollback(conn: mysql.PoolConnection) {
    return new Promise<void>((resolve, reject) => {
      conn.rollback((err: mysql.MysqlError) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async close(conn: mysql.PoolConnection) {
    conn.release();
  }

  async end(): Promise<void> {}

  async run(queryStmt: string | sql.Statement | sql.Statement[], connection?: mysql.Connection) {
    let { query, dataArgs } = this.prepareQuery(queryStmt);
    let conn = connection ?? this.connectionPool;

    let data = await new Promise<any>((resolve, reject) => {
      conn.query(query, dataArgs, function (err: Error | null, r: any) {
        if (err) {
          reject(err);
        } else {
          resolve(r);
        }
      });
    });

    let result = new bean.ResultSet();
    if (data.insertId) result.id = data.insertId;
    if (data.changedRows) {
      result.rowCount = data.changedRows;
    } else if (Array.isArray(data)) {
      result.rows = data;
      result.rowCount = data.length;
    }
    return result;
  }

  async stream(queryStmt: string | sql.Statement | sql.Statement[], connection?: mysql.Connection) {
    let { query, dataArgs } = this.prepareQuery(queryStmt);
    let conn = connection ?? this.connectionPool;

    let stream = conn.query(query, dataArgs).stream();
    return stream;
  }
}
