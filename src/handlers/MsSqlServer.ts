// import * as mssql from 'mssql';

import * as bean from '../bean/index';
import Handler from '../lib/Handler';
import * as sql from '../lib/sql';
import Connection from '../lib/Connection';

export default class MsSqlServer extends Handler {
	handlerName = 'mssql';
	connectionPool = null;
	driver = null;

	constructor(config: bean.IConnectionConfig) {
		super();
		this.config = config;
		this.driver = config.driver || require('mssql');

		this.setConnectionPool();
	}

	async	setConnectionPool() {
		this.connectionPool = new this.driver.ConnectionPool({
			server: this.config.hostname,
			user: this.config.username,
			password: this.config.password,
			database: this.config.database
		}).connect();
	}

	async getConnection() {
		await this.driver.connect({
			server: this.config.hostname,
			user: this.config.username,
			password: this.config.password,
			database: this.config.database
		});
		let conn = new this.driver.Request();
		return new Connection(this, conn);
	}

	async	getTableInfo(tableName: string): Promise<Array<bean.ColumnInfo>> {
		let r = await this.run(`Select * From INFORMATION_SCHEMA.COLUMNS Where TABLE_NAME = '${tableName}'`);
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
				|| columnType.includes('text')) {
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
		if (typeof query === "string") {
			q = query;
		} else if (query instanceof sql.Statement) {
			q = query.eval(this);
			args = (query.args == undefined ? [] : query.args);
		}
		return new Promise<bean.ResultSet>((resolve, reject) => {
			if (connection && connection instanceof Connection && connection.Handler.handlerName == this.handlerName && connection.conn) {
				connection.conn.query(q, args, function (err, result) {
					if (err) reject(err);
					else {
						console.log(result);
						resolve(result);
					}
				});
			} else {
				this.connectionPool.request().query(q, args, function (err, result) {
					if (err) reject(err);
					else {
						console.log(result);
						resolve(result);
					}
				});
			}
		});
	}

}
