// @ts-ignore
import pg from 'pg';
import * as bean from '../bean/index.js';
import * as sql from '../sql/index.js';
import Handler from './Handler.js';

export default class PostgreSql extends Handler {
	handlerName = 'postgresql';

	// @ts-ignore
	driver!: typeof import('pg');
	connectionPool!: pg.Pool;

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

	async getConnection(): Promise<pg.PoolClient> {
		let conn = await this.connectionPool.connect()
		return conn;
	}

	async initTransaction(conn: pg.Client): Promise<void> { await conn.query('BEGIN'); }

	async commit(conn: pg.PoolClient): Promise<void> {
		await conn.query('COMMIT');
	}

	async rollback(conn: pg.PoolClient): Promise<void> {
		await conn.query('ROLLBACK');
	}

	async close(conn: pg.PoolClient): Promise<void> { conn.release(); }

	async end(): Promise<void> { }

	/*
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
				col.type = bean.ColumnType.OBJECT;
			} else {
				console.warn(`Invalid Column Type ${columnType} in table ${tableName}`);
				col.type = bean.ColumnType.STRING;
			}

			col.nullable = !row['is_nullable'];
			col.primaryKey = row['primarykey'];
			col.default = row['column_default'];
			result.push(col);
		});
		return result;
	}
	*/

	async run(queryStmt: string | sql.Statement | sql.Statement[], connection?: pg.Client) {
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
		query = this.convertPlaceHolder(query);

		let temp: pg.QueryResult<any>;
		if (connection) {
			temp = await connection.query(query, dataArgs);
		} else {
			let con = await this.connectionPool.connect();
			try {
				temp = await con.query(query, dataArgs);
			} finally {
				con.release();
			}
		}

		let result = new bean.ResultSet();
		result.rowCount = temp.rowCount;
		result.rows = temp.rows;
		return result;
	}

	convertPlaceHolder(query: string) {
		let i = 1;
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
