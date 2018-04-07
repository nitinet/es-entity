import * as Handler from "./../Handler";
import * as Query from "./../Query";

export default class SqlLiteHandler extends Handler.default {
	handlerName = 'sqlite';
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
