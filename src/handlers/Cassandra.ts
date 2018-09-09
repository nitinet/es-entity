import * as bean from '../bean/index';
import Handler from '../lib/Handler';
import * as sql from '../lib/sql';

export default class Cassandra extends Handler {
	handlerName = 'cassandra';
	driver = null;

	constructor(config: bean.IConnectionConfig) {
		super();
	}

	getConnection(): any {
		return null;
	}

	async	getTableInfo(tableName: string): Promise<Array<bean.ColumnInfo>> {
		return null;
	}

	async run(query: string | sql.INode): Promise<bean.ResultSet> {
		return null
	}
}
