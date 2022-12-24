import * as bean from '../bean/index.js';
import Handler from './Handler.js';
import * as sql from '../sql/index.js';

export default class Cassandra extends Handler {
	handlerName = 'cassandra';
	driver: any = null;

	constructor(config: bean.IConnectionConfig) {
		super();
	}

	async init() { }

	async getConnection(): Promise<any> { return null; }
	async initTransaction(conn: any): Promise<void> { return null; }
	async commit(conn: any): Promise<void> { return null; }
	async rollback(conn: any): Promise<void> { return null; }
	async close(con: any): Promise<void> { return null; }
	async end(): Promise<void> { return null; }

	async getTableInfo(tableName: string): Promise<Array<bean.ColumnInfo>> {
		return null;
	}

	async run(query: string | sql.INode): Promise<bean.ResultSet> {
		return null
	}
}
