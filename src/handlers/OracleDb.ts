import * as bean from '../bean/index';
import Handler from '../lib/Handler';
import * as Query from '../lib/Query';

export default class OracleDbHandler extends Handler {
	handlerName = 'oracle';
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

	async run(query: string | Query.ISqlNode): Promise<bean.ResultSet> {
		return null
	}
}
