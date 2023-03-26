// @ts-ignore
import mssql from 'mssql';

import * as bean from '../bean/index.js';
import Handler from './Handler.js';
import * as sql from '../sql/index.js';

export default class MsSqlServer extends Handler {
	handlerName = 'mssql';

	// @ts-ignore
	driver!: typeof import('mssql');
	connectionPool!: mssql.ConnectionPool;

	constructor(config: bean.IConnectionConfig) {
		super(config);
	}

	async init() {
		// @ts-ignore
		this.driver = this.config.driver ?? await import('mssql');

		let temp = new this.driver.ConnectionPool({
			server: this.config.host,
			port: this.config.port,
			user: this.config.username,
			password: this.config.password,
			database: this.config.database
		});
		this.connectionPool = await temp.connect();
	}

	async getConnection(): Promise<mssql.Request> {
		await this.driver.connect({
			server: this.config.host,
			port: this.config.port,
			user: this.config.username,
			password: this.config.password,
			database: this.config.database
		});
		return new this.driver.Request();
	}

	async initTransaction(conn: mssql.Request): Promise<void> { }
	async commit(conn: mssql.Request): Promise<void> { }
	async rollback(conn: mssql.Request): Promise<void> { }
	async close(conn: mssql.Request): Promise<void> { }
	async end(): Promise<void> { }

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

	async run(query: string | sql.Statement, args?: Array<any>, connection?: mssql.Request): Promise<bean.ResultSet> {
		let q: string;
		if (query instanceof sql.Statement) {
			q = query.eval(this);
			// args = (query.args == undefined ? [] : query.args);
		} else {
			q = query;
		}

		let conn: mssql.Request;

		if (connection) {
			conn = connection;
		} else {
			conn = this.connectionPool.request();
		}

		// let temp = await conn.query(q);

		let result: bean.ResultSet = new bean.ResultSet();
		// TODO: fix results
		// if (temp.rowCount) result.rowCount = temp.rowCount;
		// if (Array.isArray(temp.rows)) result.rows = temp.rows;
		// if (result.rows && result.rows.length > 0) result.id = result.rows[0].id;
		return result;
	}

}
