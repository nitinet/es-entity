// @ts-ignore
import oracledb from 'oracledb';

import * as bean from '../bean/index.js';
import Handler from './Handler.js';
import * as sql from '../sql/index.js';

export default class Oracle extends Handler {
	handlerName = 'oracle';

	// @ts-ignore
	driver!: typeof import('oracledb');
	connectionPool!: oracledb.Pool;

	constructor(config: bean.IConnectionConfig) {
		super(config);
	}

	async init() {
		// @ts-ignore
		this.driver = this.config.driver ?? await import('oracledb');

		this.connectionPool = await this.driver.createPool({
			user: this.config.username,
			password: this.config.password,
			connectString: `${this.config.host}:${this.config.port}/${this.config.database}`
		});

	}

	async getConnection(): Promise<oracledb.Connection> {
		let conn = await this.connectionPool.getConnection();
		// let conn = await this.driver.getConnection({
		// 	user: this.config.username,
		// 	password: this.config.password,
		// 	connectString: `${this.config.host}:${this.config.port}/${this.config.database}`
		// });
		return conn;
	}

	async initTransaction(conn: oracledb.Connection): Promise<void> { }
	async commit(conn: oracledb.Connection): Promise<void> { return conn.commit(); }
	async rollback(conn: oracledb.Connection): Promise<void> { return conn.rollback(); }
	async close(conn: oracledb.Connection): Promise<void> { return conn.close(); }
	async end(): Promise<void> { }

	/*
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
	*/

	async run(query: string | sql.Statement, args?: any[], connection?: oracledb.Connection): Promise<bean.ResultSet> {
		let dataArgs = Array<any>();
		let q: string;
		if (query instanceof sql.Statement) {
			q = query.eval(this);
			dataArgs.push(...query.args);
		} else {
			q = query;
			if (args) dataArgs.push(...args);
		}

		let temp: oracledb.Result<any>;
		if (connection) {
			temp = await connection.execute(q);
		} else {
			let conn = await this.connectionPool.getConnection();
			try {
				temp = await conn.execute(q, dataArgs);
			} finally {
				conn.close();
			}
		}

		let result = new bean.ResultSet();
		result.rows = temp.rows ?? [];
		result.rowCount = temp.rowsAffected ?? 0;
		return result;
	}

}
