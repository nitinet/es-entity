// @ts-ignore
import oracledb from 'oracledb';

import * as bean from '../bean/index.js';
import Handler from './Handler.js';
import * as sql from '../sql/index.js';

export default class Oracle extends Handler {
	handlerName = 'oracle';

	// @ts-ignore
	driver: typeof import('oracledb') = null;
	// @ts-ignore
	connectionPool: oracledb.Pool = null;

	constructor(config: bean.IConnectionConfig) {
		super(config);
	}

	async init() {
		// @ts-ignore
		this.driver = this.config.driver || await import('oracledb');

		this.connectionPool = await this.driver.createPool({
			user: this.config.username,
			password: this.config.password,
			connectString: `${this.config.host}:${this.config.port}/${this.config.database}`
		});

	}

	async getConnection(): Promise<oracledb.Connection> {
		let conn = await this.driver.getConnection({
			user: this.config.username,
			password: this.config.password,
			connectString: `${this.config.host}:${this.config.port}/${this.config.database}`
		});
		return conn;
	}

	async initTransaction(conn: bean.Connection): Promise<void> { }
	async commit(conn: bean.Connection): Promise<void> { return conn.conn.commit(); }
	async rollback(conn: bean.Connection): Promise<void> { return conn.conn.rollback(); }
	async close(conn: bean.Connection): Promise<void> { return conn.conn.close(); }
	async end(): Promise<void> { }

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
				|| columnType.includes('float')
				|| columnType.includes('double')
				|| columnType.includes('decimal')) {
				col.type = bean.ColumnType.NUMBER;
			} else if (columnType.includes('varchar')
				|| columnType.includes('text')) {
				col.type = bean.ColumnType.STRING;
			} else if (columnType.includes('timestamp')) {
				col.type = bean.ColumnType.DATE;
			} else if (columnType.includes('json')) {
				col.type = bean.ColumnType.OBJECT;
			}

			col.nullable = row['IS_NULL'] == 'YES' ? true : false;
			col.primaryKey = (<string>row['Key']).indexOf('PRI') >= 0 ? true : false;
			col.default = row['Default'];
			col.extra = row['Extra'];
			result.push(col);
		});
		return result;
	}

	async run(query: string | sql.INode, args?: Array<any>, connection?: bean.Connection): Promise<bean.ResultSet> {
		let dataArgs = Array<any>();
		let q: string;
		if (typeof query === 'string') {
			q = query;
			if (args) dataArgs.push(...args);
		} else if (query instanceof sql.Statement) {
			q = query.eval(this);
			dataArgs.push(...query.args);
		} else {
			q = '';
		}

		let temp = null;

		if (connection && connection instanceof bean.Connection && connection.Handler.handlerName == this.handlerName && connection.conn) {
			temp = await connection.conn.execute(q, args);
		} else {
			let conn = await this.connectionPool.getConnection();
			try {
				temp = await conn.execute(q, dataArgs);
			} finally {
				conn.close();
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
