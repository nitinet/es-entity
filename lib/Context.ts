/// <reference path="/usr/local/lib/typings/globals/node/index.d.ts" />

import Queryable, { DBSet } from "./Queryable";
import Handler, { ConnectionConfig, ResultSet } from "./Handler";
import MysqlHandler from "./handlers/MysqlHandler";
import OracleHandler from "./handlers/OracleDbHandler";
import MsSqlServerHandler from "./handlers/MsSqlServerHandler";
import PostGreHandler from "./handlers/PostGreHandler";
import SqlLiteHandler from "./handlers/SqlLiteHandler";
import * as Query from "./Query";
import * as Type from "./Type";

export function getHandler(config: ConnectionConfig): Handler {
	let handler: Handler = null;
	if (config.handler.toLowerCase() === "mysql") {
		handler = new MysqlHandler(config);
	} else if (config.handler.toLowerCase() === "oracle") {
		handler = new OracleHandler(config);
	} else if (config.handler.toLowerCase() === "postgre") {
		handler = new PostGreHandler(config);
	} else if (config.handler.toLowerCase() === "sqlserver") {
		handler = new MsSqlServerHandler(config);
	} else if (config.handler.toLowerCase() === "sqllite") {
		handler = new SqlLiteHandler(config);
	} else {
		throw "No Handler Found";
	}
	return handler;
}

class Context {
	entityPath: string;
	handler: Handler;

	constructor(config?: ConnectionConfig, entityPath?: string) {
		if (config) {
			this.setConfig(config);
		}
		if (entityPath) {
			this.setEntityPath(entityPath);
		}
	}

	 async init(): Promise<void> {
		let keys: (string | number | symbol)[] = Reflect.ownKeys(this);
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			let e: any = Reflect.get(this, key);
			if (e instanceof DBSet) {
				await (<DBSet<any>>e).bind(this);
			}
		}
	}

	setConfig(config: ConnectionConfig): void {
		this.handler = getHandler(config);
	}

	setEntityPath(entityPath: string): void {
		this.entityPath = entityPath;
	}

	execute(query: string | Query.ISqlNode): Promise<ResultSet> {
		return this.handler.run(query);
	}

	flush(): void { }

}

export default Context;
