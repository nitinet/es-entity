// @ts-ignore
import * as sqlite from 'sqlite3';

import * as bean from '../bean';
import Handler from './Handler';
import * as sql from '../sql';
import Connection from '../Connection';

export default class SQlite extends Handler {
	handlerName = 'sqlite';
	driver: sqlite.sqlite3 = null;
	connectionPool: sqlite.Database = null;

	constructor(config: bean.IConnectionConfig) {
		super();
	}

	async init() {
		this.driver = this.config.driver.verbose() ?? (await import('sqlite3')).verbose();
		this.connectionPool = new this.driver.Database(this.config.database)
	}

	async getConnection() {
		let res = new Connection(this, this.connectionPool);
		return res;
	}

	async initTransaction(conn) { await conn.query('BEGIN TRANSACTION'); }

	async commit(conn) { await conn.query('COMMIT'); }

	async rollback(conn) { await conn.query('ROLLBACK'); }

	async close(conn) { await conn.end(); }

	async end() { return null; }

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

	async run(query: string | sql.INode, args?: Array<any>, connection?: Connection): Promise<bean.ResultSet> {
		let queryObj = this.prepareQuery(query, args);

		let temp = null;

		let conn: sqlite.Database = null;
		if (connection && connection instanceof Connection && connection.Handler.handlerName == this.handlerName && connection.conn) {
			conn = connection.conn;
		} else {
			conn = this.connectionPool;
		}

		temp = await new Promise<any>((resolve, reject) => {
			conn.run(queryObj.query, queryObj.args, function (err: Error, r) {
				if (err) { reject(err); }
				else { resolve(r); }
			});
		});

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
