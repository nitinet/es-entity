import * as bean from '../bean';
import Handler from '../lib/Handler';
import * as sql from '../lib/sql';

export default class Oracle extends Handler {
	handlerName = 'oracle';
	driver = null;

	constructor(config: bean.IConnectionConfig) {
		super();
	}

	async init() { }

	async getConnection() { return null; }
	async openConnetion(conn) { return null; }
	async initTransaction(conn) { return null; }
	async commit(conn) { return null; }
	async rollback(conn) { return null; }
	async close(conn) { return null; }
	async end() { return null; }

	async	getTableInfo(tableName: string): Promise<Array<bean.ColumnInfo>> {
		return null;
	}

	async run(query: string | sql.INode): Promise<bean.ResultSet> {
		return null
	}
}
