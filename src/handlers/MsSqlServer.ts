// @ts-ignore
import * as mssql from 'mssql';

import * as bean from '../bean/index.js';
import Handler from './Handler.js';
import * as sql from '../sql/index.js';
import Connection from '../Connection.js';

export default class MsSqlServer extends Handler {
	handlerName = 'mssql';
	connectionPool: any = null;
	driver: typeof import('mssql') = null;

	constructor(config: bean.IConnectionConfig) {
		super();
		this.config = config;
	}

	async init() {
		this.driver = this.config.driver ?? await import('mssql');

		this.connectionPool = new this.driver.ConnectionPool({
			server: this.config.host,
			port: this.config.port,
			user: this.config.username,
			password: this.config.password,
			database: this.config.database
		}).connect();
	}

	async getConnection(): Promise<Connection> {
		await this.driver.connect({
			server: this.config.host,
			port: this.config.port,
			user: this.config.username,
			password: this.config.password,
			database: this.config.database
		});
		let conn = new this.driver.Request();
		return new Connection(this, conn);
	}

	async initTransaction(conn: Connection): Promise<void> { return null; }
	async commit(conn: Connection): Promise<void> { return null; }
	async rollback(conn: Connection): Promise<void> { return null; }
	async close(conn: Connection): Promise<void> { return null; }
	async end(): Promise<void> { return null; }

	async getTableInfo(tableName: string): Promise<Array<bean.ColumnInfo>> {
		let r = await this.run(`select Field, Type, Null, Key, Default, Extra from information_schema.columns where table_name = '${tableName}'`);
		let result: Array<bean.ColumnInfo> = new Array<bean.ColumnInfo>();
		r.rows.forEach((row) => {
			let col: bean.ColumnInfo = new bean.ColumnInfo();
			col.field = row['Field'];
			let columnType: string = (<string>row['Type']).toLowerCase();
			if (columnType.includes('tinyint(1)')) {
				col.type = bean.ColumnType.BOOLEAN;
			} else if (columnType.includes('int')
				|| columnType.includes('float')
				|| columnType.includes('double')
				|| columnType.includes('decimal')) {
				col.type = bean.ColumnType.NUMBER;
			} else if (columnType.includes('varchar')
				|| columnType.includes('text')) {
				col.type = bean.ColumnType.STRING;
			} else if (columnType.includes('timestamp')) {
				col.type = bean.ColumnType.DATE;
			} else if (columnType.includes('blob')
				|| columnType.includes('binary')) {
				col.type = bean.ColumnType.BINARY;
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
		if (typeof query === "string") {
			q = query;
		} else if (query instanceof sql.Statement) {
			q = query.eval(this);
			args = (query.args == undefined ? [] : query.args);
		}

		let temp = null;
		let conn: any = null;

		if (connection && connection instanceof Connection && connection.Handler.handlerName == this.handlerName && connection.conn) {
			conn = connection.conn;
		} else {
			conn = this.connectionPool.request();
		}

		temp = await new Promise<any>((resolve, reject) => {
			conn.query(q, args, function (err: Error, r: any) {
				if (err) { reject(err); }
				else { resolve(r); }
			});
		});

		let result: bean.ResultSet = new bean.ResultSet();
		if (temp.rowCount) result.rowCount = temp.rowCount;
		if (Array.isArray(temp.rows)) result.rows = temp.rows;
		if (result.rows && result.rows.length > 0) result.id = result.rows[0].id;
		return result;
	}

}
