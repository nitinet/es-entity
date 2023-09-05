// @ts-ignore
import sqlite from 'sqlite3';
import * as bean from '../bean/index.js';
import * as sql from '../sql/index.js';
import Handler from './Handler.js';

export default class SQlite extends Handler {
	handlerName = 'sqlite';

	// @ts-ignore
	driver!: typeof import('sqlite3');
	connectionPool!: sqlite.Database;

	async init() {
		// @ts-ignore
		this.driver = this.config.driver ?? (await import('sqlite3'));

		this.connectionPool = await new Promise((res, rej) => {
			let temp = new this.driver.Database(this.config.database, (err) => {
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

	async end(): Promise<void> { }

	/*
	async getTableInfo(tableName: string): Promise<Array<bean.ColumnInfo>> {
		let r = await this.run(`pragma table_info('${tableName}')`);
		let result: Array<bean.ColumnInfo> = new Array<bean.ColumnInfo>();
		r.rows.forEach((row) => {
			let col: bean.ColumnInfo = new bean.ColumnInfo();
			col.field = row['name'];
			let columnType: string = (<string>row['type']).toLowerCase();
			if (columnType.includes('integer')
				|| columnType.includes('real')
				|| columnType.includes('numeric')) {
				col.type = bean.ColumnType.NUMBER;
			} else if (columnType.includes('text')) {
				col.type = bean.ColumnType.STRING;
			} else if (columnType.includes('blob')) {
				col.type = bean.ColumnType.BINARY;
			}

			col.nullable = row['notnull'] == 0 ? true : false;
			col.primaryKey = row['pk'] == 1 ? true : false;
			col.default = row['dflt_value'];
			result.push(col);
		});
		return result;
	}
	*/

	async run(queryStmt: string | sql.Statement | sql.Statement[], connection?: sqlite.Database): Promise<bean.ResultSet> {
		let query: string;
		let dataArgs: any[] = [];
		if (Array.isArray(queryStmt)) {
			let tempQueries: string[] = [];
			queryStmt.forEach(a => {
				if (!(a instanceof sql.Statement)) throw new Error('Invalid Statement');
				tempQueries.push(a.eval(this));
				dataArgs.push(...a.args);
			});
			query = tempQueries.join('; ');
		} else if (queryStmt instanceof sql.Statement) {
			query = queryStmt.eval(this);
			dataArgs.push(...queryStmt.args);
		} else {
			query = queryStmt;
		}

		let conn: sqlite.Database;
		if (connection) {
			conn = connection;
		} else {
			conn = this.connectionPool;
		}

		let temp: any[] = await new Promise((resolve, reject) => {
			conn.all(query, dataArgs, function (err, r) {
				if (err) { reject(err); }
				else { resolve(r); }
			});
		});

		let result = new bean.ResultSet();
		result.rows = temp;
		result.rowCount = temp.length;
		return result;
	}

}
