// @ts-ignore
import pg from 'pg';

import * as bean from '../bean/index.js';
import Handler from './Handler.js';
import * as sql from '../sql/index.js';

export default class PostgreSql extends Handler {
	handlerName = 'postgresql';

	// @ts-ignore
	driver: typeof import('pg') = null;
	// @ts-ignore
	connectionPool: pg.Pool = null;

	constructor(config: bean.IConnectionConfig) {
		super();
		this.config = config;
	}

	async init() {
		// @ts-ignore
		this.driver = this.config.driver ?? (await import('pg')).native ?? await import('pg');

		this.connectionPool = new this.driver.Pool({
			user: this.config.username,
			password: this.config.password,
			database: this.config.database,
			host: this.config.host,
			port: this.config.port,
			max: this.config.connectionLimit
		});
	}

	async getConnection(): Promise<bean.Connection> {
		let conn = new this.driver.Client({
			host: this.config.host,
			port: this.config.port,
			user: this.config.username,
			password: this.config.password,
			database: this.config.database
		});
		try {
			await conn.connect();
			return new bean.Connection(this, conn);
		} catch (err) {
			this.context.log('Connection Creation Failed', err);
			throw err;
		}
	}

	async initTransaction(conn: any): Promise<void> { await conn.query('BEGIN'); }

	async commit(conn: any): Promise<void> { await conn.query('COMMIT'); }

	async rollback(conn: any): Promise<void> { await conn.query('ROLLBACK'); }

	async close(conn: any): Promise<void> { await conn.end(); }

	async end(): Promise<void> { return null; }

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

	async run(query: string | sql.INode, args?: Array<any>, connection?: bean.Connection) {
		let queryObj = this.prepareQuery(query, args);

		let temp = null;

		if (connection && connection instanceof bean.Connection && connection.Handler.handlerName == this.handlerName && connection.conn) {
			temp = await connection.conn.query(queryObj.query, queryObj.args);
		} else {
			let con = null;
			try {
				con = await this.connectionPool.connect();
				temp = await con.query(queryObj.query, queryObj.args);
			} finally {
				if (con) { con.release(); }
			}
		}

		let result: bean.ResultSet = new bean.ResultSet();
		if (temp.rowCount) result.rowCount = temp.rowCount;
		if (Array.isArray(temp.rows)) result.rows = temp.rows;
		if (result.rows && result.rows.length > 0) result.id = result.rows[0].id;
		return result;
	}

	convertPlaceHolder(query: string) {
		let i = 1
		while (query.includes('?')) {
			query = query.replace('?', `$${i}`);
			i++;
		}
		return query;
	}

	limit(size: string, index?: string): string {
		return ' limit ' + size + (index ? ' OFFSET ' + index : '');
	}
}
