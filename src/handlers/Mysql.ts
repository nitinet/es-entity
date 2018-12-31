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
		this.driver = config.driver || require('mysql');
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
			conn.connect((err) => {
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

	openConnetion(conn): Promise<any> {
		let that = this;
		let p = new Promise((resolve, reject) => {
			conn = this.driver.createConnection({
				host: this.config.host,
				user: this.config.username,
				password: this.config.password,
				database: this.config.database
			});
			conn.connect((err) => {
				if (err) {
					that.context.log('Connection Creation Failed');
					reject(err);
				} else {
					that.context.log('Connection Creation Successful');
					resolve(conn);
				}
			});
		});
		return p;
	}

	initTransaction(conn): Promise<void> {
		let that = this;
		let p = new Promise<void>((resolve, reject) => {
			conn.beginTransaction((err) => {
				if (err) {
					that.context.log('Initializing Transaction Failed');
					reject(err);
				} else {
					that.context.log('Initializing Transaction Successful');
					resolve();
				}
			});
		});
		return p;
	}

	commit(conn): Promise<void> {
		let that = this;
		let p = new Promise<void>((resolve, reject) => {
			conn.commit((err) => {
				if (err) {
					that.context.log('Commiting Transaction Failed');
					reject(err);
				} else {
					that.context.log('Commiting Transaction Successful');
					resolve();
				}
			});
		});
		return p;
	}

	rollback(conn): Promise<void> {
		let p = new Promise<void>((resolve) => {
			conn.rollback(() => {
				resolve();
			});
		});
		return p;
	}

	close(conn): Promise<void> {
		let that = this;
		let p = new Promise<void>((resolve, reject) => {
			conn.end((err) => {
				if (err) {
					that.context.log('Connection Close Failed');
					reject(err);
				} else {
					that.context.log('Connection Close Successful');
					resolve();
				}
			});
		});
		return p;
	}

	async	getTableInfo(tableName: string): Promise<Array<bean.ColumnInfo>> {
		let r = await this.run('describe ' + tableName);
		let result: Array<bean.ColumnInfo> = new Array<bean.ColumnInfo>();
		r.rows.forEach((row) => {
			let a: bean.ColumnInfo = new bean.ColumnInfo();
			a.field = row['Field'];
			let columnType: string = (<string>row['Type']).toLowerCase();
			if (columnType.includes('tinyint(1)')) {
				a.type = 'boolean';
			} else if (columnType.includes('int')
				|| columnType.includes('float')
				|| columnType.includes('double')
				|| columnType.includes('decimal')) {
				a.type = 'number';
			} else if (columnType.includes('varchar')
				|| columnType.includes('text')
				|| columnType.includes('json')) {
				a.type = 'string';
			} else if (columnType.includes('timestamp')) {
				a.type = 'date';
			}

			a.nullable = row['Null'] == 'YES' ? true : false;
			a.primaryKey = (<string>row['Key']).indexOf('PRI') >= 0 ? true : false;
			a.default = row['Default'];
			a.extra = row['Extra'];
			result.push(a);
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
		let result: bean.ResultSet = new bean.ResultSet();
		let p = new Promise<any>((resolve, reject) => {
			if (connection && connection instanceof Connection && connection.Handler.handlerName == this.handlerName && connection.conn) {
				connection.conn.query(q, args, function (err, r) {
					if (err) { reject(err); }
					resolve(r);
				});
			} else {
				this.connectionPool.query(q, args, function (err, r) {
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
		return p;
	}

}
