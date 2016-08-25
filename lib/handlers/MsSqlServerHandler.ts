import Handler, {ResultSet, ConnectionConfig} from "./../Handler";
import * as Query from "./../Query";

class MsSqlServerHandler extends Handler {

	constructor(config: ConnectionConfig) {
		super();
	}

	getConnection(): any {
		return null;
	}

	async run(query: string | Query.ISqlNode): Promise<ResultSet> {
		return null
	}

}

export default MsSqlServerHandler;
