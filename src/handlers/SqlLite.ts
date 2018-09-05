import * as bean from '../bean/index';
import Handler from '../lib/Handler';
import * as sql from '../lib/sql';

export default class SqlLiteHandler extends Handler {
	handlerName = 'sqlite';
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

	async run(query: string | sql.ISqlNode): Promise<bean.ResultSet> {
		return null
	}
}
