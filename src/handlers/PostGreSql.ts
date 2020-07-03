// import * as pg from 'pg';
import * as bean from '../bean/index';
import Handler from '../lib/Handler';
import * as sql from '../lib/sql';
import Connection from '../lib/Connection';

export default class PostgreSql extends Handler {
	driver = null;
	handlerName = 'postgresql';
	connectionPool = null;

	constructor(config: bean.IConnectionConfig) {
		super();
		this.config = config;
	}

	async init() {
		// @ts-ignore
		this.driver = this.config.driver || await import('pg');
		this.connectionPool = new this.driver.Pool({
			user: this.config.username,
			password: this.config.password,
			database: this.config.database,
			host: this.config.host,
			port: this.config.port,
			max: this.config.connectionLimit
		});
	}

	async getConnection(): Promise<Connection> {
		let conn = new this.driver.Client({
			host: this.config.host,
			port: this.config.port,
			user: this.config.username,
			password: this.config.password,
			database: this.config.database
		});
		return this.openConnetion(conn);
	}

	async openConnetion(conn) {
		try {
			await conn.connect();
			return new Connection(this, conn);
		} catch (err) {
			this.context.log('Connection Creation Failed');
			throw err;
		}
	}

	async initTransaction(conn) { await conn.query('BEGIN'); }

	async commit(conn) { await conn.query('COMMIT'); }

	async rollback(conn) { await conn.query('ROLLBACK'); }

	async close(conn) { await conn.end(); }

	async end() { return null; }

	async getTableInfo(tableName: string) {
		let descQuery = `select f.ordinal_position, f.column_name, f.data_type, f.is_nullable, f.column_default,
		case when (select count(1) from pg_constraint p where p.conrelid = c.oid and f.ordinal_position = any(p.conkey) and p.contype   = 'p') > 0 then true else false end as primarykey
	from information_schema.columns f
		join pg_class c on c.relname = f.table_name
	where f.table_name = '${tableName}'`;

		let tableInfo = await this.run(descQuery);
		let result: Array<bean.ColumnInfo> = new Array<bean.ColumnInfo>();

		tableInfo.rows.forEach((row) => {
			let col: bean.ColumnInfo = new bean.ColumnInfo();
			col.field = row['column_name'];
			let columnType: string = (<string>row['data_type']).toLowerCase();

			if (columnType.includes('boolean')) {
				col.type = bean.ColumnType.BOOLEAN;
			} else if (columnType.includes('int') ||
				columnType.includes('float') ||
				columnType.includes('double') ||
				columnType.includes('decimal') ||
				columnType.includes('real') ||
				columnType.includes('numeric')) {
				col.type = bean.ColumnType.NUMBER;
			} else if (columnType.includes('varchar') ||
				columnType.includes('text') ||
				columnType.includes('character varying') ||
				columnType.includes('uuid')) {
				col.type = bean.ColumnType.STRING;
			} else if (columnType.includes('timestamp') || columnType.includes('date')) {
				col.type = bean.ColumnType.DATE;
			} else if (columnType.includes('json')) {
				col.type = bean.ColumnType.JSON;
			}
			col.nullable = !row['is_nullable'];
			col.primaryKey = row['primarykey'];
			col.default = row['column_default'];
			result.push(col);
		});
		return result;
	}

	async run(query: string | sql.INode, args?: Array<any>, connection?: Connection) {
		let q: string = null;
		if (typeof query === 'string') {
			q = query;
		} else if (query instanceof sql.Statement) {
			q = query.eval(this);
			args = (query.args == undefined ? [] : query.args);
		}

		let temp = null;

		if (connection && connection instanceof Connection && connection.Handler.handlerName == this.handlerName && connection.conn) {
			temp = await connection.conn.query(q, args);
		} else {
			let con = null;
			try {
				con = await this.connectionPool.connect();
				temp = await con.query(q, args);
			} finally {
				con.release();
			}
		}

		let result: bean.ResultSet = new bean.ResultSet();
		if (temp.rowCount) result.rowCount = temp.rowCount;
		if (Array.isArray(temp.rows)) result.rows = temp.rows;
		if (result.rows && result.rows.length > 0) result.id = result.rows[0].id;
		return result;
	}

	convertPlaceHolder(query: string) {
		for (let i = 1; query.includes('?'); i++) {
			query = query.replace('?', '$' + i);
		}
		return query;
	}

	insertQuery(collection: string, columns: string, values: string) {
		return super.insertQuery(collection, columns, values) + ' returning id';
	}

	limit(val0: string, val1: string): string { return ' limit ' + val0 + (val1 ? ' OFFSET ' + val1 : ''); }
}
