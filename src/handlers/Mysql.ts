// import * as mysql from 'mysql';

import * as bean from '../bean/index';
import Handler from '../lib/Handler';
import * as sql from '../lib/sql';
import Connection from '../lib/Connection';

export default class Mysql extends Handler {
	handlerName = 'mysql';
	connectionPool = null;
	driver = null;

	constructor(config: bean.IConnectionConfig) {
		super();
		this.config = config;
	}

	async init() {
		// @ts-ignore
		this.driver = this.config.driver || await import('mysql');

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
					that.context.log('Connection Creation Failed');
					reject(err);
				} else {
					that.context.log('Connection Creation Successful');
					let res = new Connection(this, conn);
					resolve(res);
				}
			});
		});
	}

	openConnetion(conn: Connection) {
		let that = this;
		return new Promise((resolve, reject) => {
			conn = this.driver.createConnection({
				host: this.config.host,
				user: this.config.username,
				password: this.config.password,
				database: this.config.database
			});
			conn.conn.connect((err: Error) => {
				if (err) {
					that.context.log('Connection Creation Failed');
					reject(err);
				} else {
					that.context.log('Connection Creation Successful');
					resolve(conn);
				}
			});
		});
	}

	initTransaction(conn: Connection) {
		let that = this;
		return new Promise<void>((resolve, reject) => {
			conn.conn.beginTransaction((err: Error) => {
				if (err) {
					that.context.log('Initializing Transaction Failed');
					reject(err);
				} else {
					that.context.log('Initializing Transaction Successful');
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
					that.context.log('Commiting Transaction Failed');
					reject(err);
				} else {
					that.context.log('Commiting Transaction Successful');
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
					that.context.log('Connection Close Failed');
					reject(err);
				} else {
					that.context.log('Connection Close Successful');
					resolve();
				}
			});
		});
	}

	async end() { return null; }

	async	getTableInfo(tableName: string): Promise<Array<bean.ColumnInfo>> {
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
		let q: string = null;
		if (typeof query === 'string') {
			q = query;
		} else if (query instanceof sql.Statement) {
			q = query.eval(this);
			args = query.args;
		}

		this.context.log('query:' + q);
		let result = new bean.ResultSet();
		return new Promise<any>((resolve, reject) => {
			if (connection && connection instanceof Connection && connection.Handler.handlerName == this.handlerName && connection.conn) {
				connection.conn.query(q, args, function (err: Error, r) {
					if (err) { reject(err); }
					resolve(r);
				});
			} else {
				this.connectionPool.query(q, args, function (err: Error, r) {
					if (err) { reject(err); }
					resolve(r);
				});
			}
		}).then((res) => {
			if (res.insertId)
				result.id = res.insertId;
			if (res.changedRows) {
				result.rowCount = res.changedRows;
			} else if (Array.isArray(res)) {
				result.rows = <Array<any>>res;
				result.rowCount = (<Array<any>>res).length;
			}
			return result;
		});
	}

}
