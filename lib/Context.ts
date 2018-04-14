import Queryable, { DBSet } from "./Queryable";
import Handler, { ConnectionConfig, ResultSet } from "./Handler";
import MysqlHandler from "./handlers/MysqlHandler";
import OracleHandler from "./handlers/OracleDbHandler";
import MsSqlServerHandler from "./handlers/MsSqlServerHandler";
import PostGreHandler from "./handlers/PostGreSqlHandler";
import SqlLiteHandler from "./handlers/SqlLiteHandler";
import * as Query from "./Query";
import * as Type from "./Type";
import Connection from './Connection';

export function getHandler(config: ConnectionConfig): Handler {
	let handler: Handler = null;
	if (config.handler.toLowerCase() === "mysql") {
		handler = new MysqlHandler(config);
	} else if (config.handler.toLowerCase() === "oracle") {
		handler = new OracleHandler(config);
	} else if (config.handler.toLowerCase() === "postgresql") {
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

export default class Context {
	entityPath: string;
	handler: Handler;
	connection: Connection = null;
	logger = null;

	constructor(config?: ConnectionConfig, entityPath?: string) {
		if (config) {
			this.setConfig(config);
		}
		if (entityPath) {
			this.setEntityPath(entityPath);
		}
	}

	setLogger(logger) {
		this.logger = logger;
	}

	log(arg) {
		if (this.logger) {
			this.logger.trace(arg);
		}
	}

	init() {
		let keys: (string | number | symbol)[] = Reflect.ownKeys(this);
		let ps: Promise<void>[] = new Array();
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			let o: any = Reflect.get(this, key);
			if (o instanceof DBSet) {
				ps.push((<DBSet<any>>o).bind(this));
			}
		}
		return Promise.all(ps);
	}

	setConfig(config: ConnectionConfig): void {
		this.handler = getHandler(config);
		this.handler.context = this;
	}

	setEntityPath(entityPath: string): void {
		this.entityPath = entityPath;
	}

	async execute(query: string | Query.ISqlNode, args?: Array<any>): Promise<ResultSet> {
		return await this.handler.run(query, args, this.connection);
	}

	getCriteria(): Query.SqlExpression {
		return new Query.SqlExpression();
	}

	flush(): void { }

	async initTransaction(): Promise<this> {
		let res = this;
		// Create Clone if connection not present
		if (!this.connection) {
			res = Object.assign({}, this);
			Object.setPrototypeOf(res, Object.getPrototypeOf(this));
			let keys = Reflect.ownKeys(res);
			keys.forEach((key) => {
				let prop = Reflect.get(res, key);
				if (prop instanceof DBSet) {
					prop.context = res;
				}
			});
		}
		res.connection = await res.handler.getConnection();
		await res.connection.initTransaction();
		return res;
	}

	async commit() {
		await this.connection.commit();
		await this.connection.close();
	}

	async rollback() {
		await this.connection.rollback();
		await this.connection.close();
	}

}
