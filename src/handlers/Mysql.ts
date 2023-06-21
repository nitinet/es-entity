// @ts-ignore
import mysql from 'mysql';

import * as bean from '../bean/index.js';
import Handler from './Handler.js';
import * as sql from '../sql/index.js';

// let typeCast: mysql.TypeCast = function (field: mysql.UntypedFieldInfo & {
// 	type: string;
// 	string(): null | string;
// 	buffer(): null | Buffer;
// 	geometry(): null | mysql.GeometryType;
// }, next: () => void) {
// 	if (field.type === 'TINY' && field.length === 1) {
// 		return (field.string() === '1');
// 	} else if (field.type === 'JSON') {
// 		let data = field.string();
// 		return null != data ? JSON.parse(data) : null;
// 	} else {
// 		return next();
// 	}
// }

export default class Mysql extends Handler {
	handlerName = 'mysql';

	// @ts-ignore
	driver!: typeof import('mysql');
	connectionPool!: mysql.Pool;

	constructor(config: bean.IConnectionConfig) {
		super(config);

		// this.serializeMap.set(bean.ColumnType.OBJECT, (val) => JSON.stringify(val));
		// this.deSerializeMap.set(bean.ColumnType.OBJECT, (val) => JSON.parse(val));

		// this.serializeMap.set(bean.ColumnType.BOOLEAN, (val: boolean) => val ? '1' : '0');
		// this.deSerializeMap.set(bean.ColumnType.BOOLEAN, (val) => val == '1');
	}

	async init() {
		// @ts-ignore
		this.driver = this.config.driver ?? await import('mysql');

		this.connectionPool = this.driver.createPool({
			connectionLimit: this.config.connectionLimit,
			host: this.config.host,
			port: this.config.port,
			user: this.config.username,
			password: this.config.password,
			database: this.config.database
		});
	}

	getConnection(): Promise<mysql.Connection> {
		let that = this;
		return new Promise<mysql.Connection>((resolve, reject) => {
			let conn = that.driver.createConnection({
				host: that.config.host,
				port: that.config.port,
				user: that.config.username,
				password: that.config.password,
				database: that.config.database
			});
			conn.connect((err: Error) => {
				if (err) {
					// that.context.log('Connection Creation Failed', err);
					reject(err);
				} else {
					resolve(conn);
				}
			});
		});
	}

	initTransaction(conn: mysql.Connection) {
		return new Promise<void>((resolve, reject) => {
			conn.beginTransaction((err: Error) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	commit(conn: mysql.Connection) {
		return new Promise<void>((resolve, reject) => {
			conn.commit((err: Error) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	rollback(conn: mysql.Connection) {
		return new Promise<void>((resolve) => {
			conn.rollback(() => {
				resolve();
			});
		});
	}

	close(conn: mysql.Connection) {
		return new Promise<void>((resolve, reject) => {
			conn.end((err?: Error) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

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
				|| columnType.includes('real')
				|| columnType.includes('float')
				|| columnType.includes('double')
				|| columnType.includes('decimal')) {
				col.type = bean.ColumnType.NUMBER;
			} else if (columnType.includes('varchar')
				|| columnType.includes('text')
				|| columnType == 'time') {
				col.type = bean.ColumnType.STRING;
			} else if (columnType.includes('timestamp')
				|| columnType.includes('date')) {
				col.type = bean.ColumnType.DATE;
			} else if (columnType.includes('blob')
				|| columnType.includes('binary')) {
				col.type = bean.ColumnType.BINARY;
			} else if (columnType.includes('json')) {
				col.type = bean.ColumnType.OBJECT;
			} else {
				throw new Error(`Invalid Column Type ${columnType} in table ${tableName}`);
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

	async run(query: string | sql.Statement, args?: Array<any>, connection?: mysql.Connection): Promise<bean.ResultSet> {
		let queryObj = this.prepareQuery(query, args);

		let temp = null;

		if (connection) {
			temp = await new Promise<any>((resolve, reject) => {
				connection.query(queryObj.query, queryObj.args, function (err: Error | null, r: any) {
					if (err) { reject(err); }
					else { resolve(r); }
				});
			});
		} else {
			temp = await new Promise<any>((resolve, reject) => {
				this.connectionPool.query(queryObj.query, queryObj.args, function (err: Error | null, r: any) {
					if (err) { reject(err); }
					else { resolve(r); }
				});
			});
		}

		let result = new bean.ResultSet();
		if (temp.insertId) result.id = temp.insertId;
		if (temp.changedRows) {
			result.rowCount = temp.changedRows;
		} else if (Array.isArray(temp)) {
			result.rows = temp;
			result.rowCount = temp.length;
		}
		return result;
	}

}
