// @ts-ignore
import * as mysql from 'mysql';

import * as bean from '../bean/index.js';
import Handler from './Handler.js';
import * as sql from '../sql/index.js';
import Connection from '../Connection.js';

export default class Mysql extends Handler {
	handlerName = 'mysql';
	driver: typeof import('mysql') = null;
	connectionPool: mysql.Pool = null;

	constructor(config: bean.IConnectionConfig) {
		super();
		this.config = config;
	}

	async init() {
		this.driver = this.config.driver ?? await import('mysql');

		this.connectionPool = this.driver.createPool({
			connectionLimit: this.config.connectionLimit,
			host: this.config.host,
			port: this.config.port,
			user: this.config.username,
			password: this.config.password,
			database: this.config.database
		});
	}

	getConnection(): Promise<Connection> {
		let that = this;
		return new Promise<Connection>((resolve, reject) => {
			let conn = that.driver.createConnection({
				host: that.config.host,
				port: that.config.port,
				user: that.config.username,
				password: that.config.password,
				database: that.config.database
			});
			conn.connect((err: Error) => {
				if (err) {
					that.context.log('Connection Creation Failed', err);
					reject(err);
				} else {
					let res = new Connection(this, conn);
					resolve(res);
				}
			});
		});
	}

	initTransaction(conn: Connection) {
		let that = this;
		return new Promise<void>((resolve, reject) => {
			conn.conn.beginTransaction((err: Error) => {
				if (err) {
					that.context.log('Initializing Transaction Failed', err);
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	commit(conn: Connection) {
		let that = this;
		return new Promise<void>((resolve, reject) => {
			conn.conn.commit((err: Error) => {
				if (err) {
					that.context.log('Commiting Transaction Failed', err);
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	rollback(conn: Connection) {
		return new Promise<void>((resolve) => {
			conn.conn.rollback(() => {
				resolve();
			});
		});
	}

	close(conn: Connection) {
		let that = this;
		return new Promise<void>((resolve, reject) => {
			conn.conn.end((err: Error) => {
				if (err) {
					that.context.log('Connection Close Failed', err);
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	async end(): Promise<void> { return null; }

	async getTableInfo(tableName: string): Promise<Array<bean.ColumnInfo>> {
		let r = await this.run('describe ' + tableName);
		let result: Array<bean.ColumnInfo> = new Array<bean.ColumnInfo>();
		r.rows.forEach((row) => {
			let col: bean.ColumnInfo = new bean.ColumnInfo();
			col.field = row['Field'];
			let columnType: string = (<string>row['Type']).toLowerCase();
			if (columnType.includes('tinyint(1)')) {
				col.type = bean.ColumnType.BOOLEAN;
			} else if (columnType.includes('int')
				|| columnType.includes('real')
				|| columnType.includes('float')
				|| columnType.includes('double')
				|| columnType.includes('decimal')) {
				col.type = bean.ColumnType.NUMBER;
			} else if (columnType.includes('varchar')
				|| columnType.includes('text')
				|| columnType == 'time') {
				col.type = bean.ColumnType.STRING;
			} else if (columnType.includes('timestamp')
				|| columnType.includes('date')) {
				col.type = bean.ColumnType.DATE;
			} else if (columnType.includes('blob')
				|| columnType.includes('binary')) {
				col.type = bean.ColumnType.BINARY;
			} else if (columnType.includes('json')) {
				col.type = bean.ColumnType.JSON;
			}

			col.nullable = row['Null'] == 'YES' ? true : false;
			col.primaryKey = (<string>row['Key']).indexOf('PRI') >= 0 ? true : false;
			col.default = row['Default'];
			col.extra = row['Extra'];
			result.push(col);
		});
		return result;
	}

	async run(query: string | sql.INode, args?: Array<any>, connection?: Connection): Promise<bean.ResultSet> {
		let queryObj = this.prepareQuery(query, args);

		let temp = null;

		if (connection && connection instanceof Connection && connection.Handler.handlerName == this.handlerName && connection.conn) {
			let conn: mysql.Connection = connection.conn;
			temp = await new Promise<any>((resolve, reject) => {
				conn.query(queryObj.query, queryObj.args, function (err: Error, r) {
					if (err) { reject(err); }
					else { resolve(r); }
				});
			});
		} else {
			let conn: mysql.PoolConnection = null;
			try {
				conn = await new Promise((resolve, reject) => {
					this.connectionPool.getConnection(function (err, newConn) {
						if (err) { reject(err); }
						else { resolve(newConn); }
					});
				});

				temp = await new Promise<any>((resolve, reject) => {
					conn.query(queryObj.query, queryObj.args, function (err: Error, r) {
						if (err) { reject(err); }
						else { resolve(r); }
					});
				});
			} finally {
				if (conn) {
					conn.release();
				}
			}
		}

		let result = new bean.ResultSet();
		if (temp.insertId)
			result.id = temp.insertId;
		if (temp.changedRows) {
			result.rowCount = temp.changedRows;
		} else if (Array.isArray(temp)) {
			result.rows = temp;
			result.rowCount = temp.length;
		}
		return result;
	}

}
