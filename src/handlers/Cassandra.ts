import * as bean from '../bean/index';
import Handler from '../Handler';
import * as sql from '../sql';

export default class Cassandra extends Handler {
	handlerName = 'cassandra';
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
