import * as bean from '../bean';
import Handler from './Handler';
import * as sql from '../sql';
import Connection from '../Connection';

// import * as oracledb from 'oracledb';

export default class Oracle extends Handler {
	handlerName = 'oracle';
	// connectionPool: oracledb.IConnectionPool = null;
	connectionPool = null;
	driver = null;
	// driver = oracledb;

	constructor(config: bean.IConnectionConfig) {
		super();
		this.config = config;
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

	async getConnection() {
		let conn = await this.driver.getConnection({
			user: this.config.username,
			password: this.config.password,
			connectString: `${this.config.host}:${this.config.port}/${this.config.database}`
		});
		return new Connection(this, conn);
	}

	async openConnetion(conn: Connection) { return null; }
	async initTransaction(conn: Connection) { return null; }
	async commit(conn: Connection) { return conn.conn.commit(); }
	async rollback(conn: Connection) { return conn.conn.rollback(); }
	async close(conn: Connection) { return conn.conn.close(); }
	async end() { return null; }

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
				col.type = bean.ColumnType.JSON;
			}

			col.nullable = row['IS_NULL'] == 'YES' ? true : false;
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

		let temp = null;

		if (connection && connection instanceof Connection && connection.Handler.handlerName == this.handlerName && connection.conn) {
			temp = await connection.conn.execute(q, args);
		} else {
			let conn = null;
			try {
				conn = await this.connectionPool.getConnection();
				temp = await conn.execute(q, args);
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
			result.rows = <Array<any>>temp;
			result.rowCount = (<Array<any>>temp).length;
		}
		return result;
	}

}
