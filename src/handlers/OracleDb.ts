import * as Handler from '../lib/Handler';
import * as Query from '../lib/Query';

export default class OracleDbHandler extends Handler.default {
	handlerName = 'oracle';
	driver = null;

	constructor(config: Handler.ConnectionConfig) {
		super();
	}

	getConnection(): any {
		return null;
	}

	async	getTableInfo(tableName: string): Promise<Array<Handler.ColumnInfo>> {
		return null;
	}

	async run(query: string | Query.ISqlNode): Promise<Handler.ResultSet> {
		return null
	}
}
