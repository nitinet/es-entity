// @ts-ignore
import mssql from 'mssql';
import * as bean from '../bean/index.js';
import * as sql from '../sql/index.js';
import Handler from './Handler.js';

export default class MsSqlServer extends Handler {
	handlerName = 'mssql';

	// @ts-ignore
	driver!: typeof import('mssql');
	connectionPool!: mssql.ConnectionPool;

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

	/*
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
	*/

	async run(queryStmt: string | sql.Statement | sql.Statement[], connection?: mssql.Request): Promise<bean.ResultSet> {
		let query: string;
		let dataArgs: any[] = [];
		if (Array.isArray(queryStmt)) {
			let tempQueries: string[] = [];
			queryStmt.forEach(a => {
				if (!(a instanceof sql.Statement)) throw new Error('Invalid Statement');
				tempQueries.push(a.eval(this));
				dataArgs.push(...a.args);
			});
			query = tempQueries.join('; ').concat(';');
		} else if (queryStmt instanceof sql.Statement) {
			query = queryStmt.eval(this);
			dataArgs.push(...queryStmt.args);
		} else {
			query = queryStmt;
		}

		let conn: mssql.Request;

		if (connection) {
			conn = connection;
		} else {
			conn = this.connectionPool.request();
		}

		let temp = await conn.query(query);

		let result: bean.ResultSet = new bean.ResultSet();
		result.rowCount = temp.rowsAffected[0] ?? 0;
		result.rows = temp.recordset;
		return result;
	}

}
