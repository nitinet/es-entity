import * as fs from 'fs';

import * as util from '../Util';
import * as Handler from "./../Handler";
import * as Query from "./../Query";
import Connection from '../Connection';

class PostGreHandler extends Handler.default {
	driver = null;
	handlerName = 'postgresql';
	connectionPool = null;

	constructor(config: Handler.ConnectionConfig) {
		super();
		this.driver = require('pg');
		this.config = config;
		this.connectionPool = new this.driver.Pool({
			user: this.config.username,
			password: this.config.password,
			database: this.config.database,
			host: this.config.hostname,
			max: this.config.connectionLimit
		});
	}

	async	getConnection(): Promise<Connection> {
		let conn = new this.driver.Client({
			host: this.config.hostname,
			user: this.config.username,
			password: this.config.password,
			database: this.config.database
		});
		try {
			await conn.connect();
			return new Connection(this, conn);
		} catch (err) {
			throw err;
		}
	}

	async	initTransaction(conn) { await conn.query('BEGIN'); }

	async	commit(conn) { await conn.query('COMMIT'); }

	async	rollback(conn) { await conn.query('ROLLBACK'); }

	async	close(conn) { conn.release() }

	getTableInfo(tableName: string): Array<Handler.ColumnInfo> {
		let describeTableQuery = fs.readFileSync('../../assets/postgresql_describe_query.sql', 'utf-8');
		let descQuery = describeTableQuery.replace('?', tableName);
		let tableInfo = util.deAsync(this.run(descQuery));
		let result: Array<Handler.ColumnInfo> = new Array<Handler.ColumnInfo>();

		tableInfo.rows.forEach((row) => {
			let aObj: Handler.ColumnInfo = new Handler.ColumnInfo();
			aObj.field = row["field"];
			let columnType: string = (<string>row["data_type"]).toLowerCase();

			if (columnType.includes("int") ||
				columnType.includes("float") ||
				columnType.includes("double") ||
				columnType.includes("decimal") ||
				columnType.includes("real") ||
				columnType.includes("numeric")) {
				aObj.type = "number";
			}
			else if (columnType.includes("varchar") ||
				columnType.includes("text") ||
				columnType.includes("character varying")) {
				aObj.type = "string";
			}
			else if (columnType.includes("timestamp") || columnType.includes("date")) {
				aObj.type = "date";
			}

			aObj.nullable = !row["notnull"];
			aObj.primaryKey = row["primarykey"];
			aObj.default = row["default"];
			result.push(aObj);
		});
		return result;
	}

	async run(query: string | Query.ISqlNode, args?: Array<any>, connection?: Connection): Promise<Handler.ResultSet> {
		let q: string = null;
		if (typeof query === "string") {
			q = query;
		} else if (query instanceof Query.SqlStatement) {
			q = query.eval(this);
			args = (query.args == undefined ? [] : query.args);
		}

		let result: Handler.ResultSet = new Handler.ResultSet();
		if (connection && connection instanceof Connection && connection.Handler.handlerName == this.handlerName && connection.conn) {
			var r = await connection.conn.query(q, args);
		} else {
			let conn = await this.connectionPool.connect();
			let r = await conn.query(q, args);
			conn.release();
		}
		if (r.rowCount) result.rowCount = r.rowCount;
		if (Array.isArray(r.rows)) result.rows = r.rows.slice();
		if (Array.isArray(r.rows) && r.rows.length > 0) result.id = r.rows[0].id;
		return result;
	}

	convertPlaceHolder(query: string): string {
		let result: string = '';
		let index = 0;
		query.replace('?', (a) => {
			index++;
			return '$' + index;
		});
		return result;
	}

	insertQuery(collection: string, columns: string, values: string): string { return super.insertQuery(collection, columns, values) + ' returning id'; }
}

export default PostGreHandler;
