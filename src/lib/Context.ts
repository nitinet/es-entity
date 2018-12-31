import { DBSet } from './collection';
import Handler from './Handler';
import * as sql from './sql';
import Connection from './Connection';
import * as bean from '../bean/index';
import { IEntityType } from './types';

import Mysql from '../handlers/Mysql';
import OracleHandler from '../handlers/Oracle';
import MsSqlServer from '../handlers/MsSqlServer';
import PostgreSql from '../handlers/PostGreSql';
import SQLite from '../handlers/SQLite';
import Cassandra from '../handlers/Cassandra'

function getHandler(config: bean.IConnectionConfig): Handler {
	let handler: Handler = null;
	switch (config.handler) {
		case bean.HandlerType[bean.HandlerType.mysql]:
			handler = new Mysql(config);
			break;

		case bean.HandlerType[bean.HandlerType.oracle]:
			handler = new OracleHandler(config);
			break;

		case bean.HandlerType[bean.HandlerType.postgresql]:
			handler = new PostgreSql(config);
			break;

		case bean.HandlerType[bean.HandlerType.mssql]:
			handler = new MsSqlServer(config);
			break;

		case bean.HandlerType[bean.HandlerType.sqlite]:
			handler = new SQLite(config);
			break;

		case bean.HandlerType[bean.HandlerType.cassandra]:
			handler = new Cassandra(config);
			break;

		default:
			throw 'No Handler Found';
	}
	return handler;
}

export default class Context {
	private _handler: Handler;
	private entityPath: string;
	private connection: Connection = null;
	private logger = null;
	public dbSetMap = new Map<IEntityType<any>, DBSet<any>>();

	constructor(config?: bean.IConnectionConfig, entityPath?: string) {
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
				this.dbSetMap.set(o.getEntityType(), o);
			}
		}
		return Promise.all(ps);
	}

	setConfig(config: bean.IConnectionConfig): void {
		this.handler = getHandler(config);
	}

	get handler() {
		return this._handler;
	}

	set handler(handler: Handler) {
		this._handler = handler;
		this._handler.context = this;
	}

	getEntityPath() {
		return this.entityPath;
	}

	setEntityPath(entityPath: string) {
		this.entityPath = entityPath;
	}

	async execute(query: string | sql.INode, args?: Array<any>): Promise<bean.ResultSet> {
		return await this.handler.run(query, args, this.connection);
	}

	getCriteria(): sql.Expression {
		return new sql.Expression();
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

	end() {
		return this.handler.end();
	}

}
