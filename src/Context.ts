import * as sql from './sql/index.js';
import * as bean from './bean/index.js';
import Handler from './handlers/Handler.js';
import * as types from './model/types.js';
import getHandler from './handlers/getHandler.js';
import TableSet from './collection/TableSet.js';
import DBSet from './collection/DBSet.js';

export default class Context {
	private _handler: Handler;
	// private _entityPath: string;
	private connection: bean.Connection | null = null;
	private logger: any = null;

	public tableSetMap = new Map<types.IEntityType<any>, DBSet<any>>();
	public config: bean.IConfig;

	constructor(config: bean.IConfig) {
		this.config = config;

		if (!this.config.dbConfig) {
			throw new Error('Database Config Not Found');
		}

		this._handler = getHandler(this.config.dbConfig);
		// if (this.config.entityPath) { this.setEntityPath(this.config.entityPath); }
		this.logger = this.config.logger || console;
	}

	log(...arg: any[]) {
		this.logger.error(arg);
	}

	async init() {
		await this.handler.init();

		await Promise.all(Reflect.ownKeys(this).filter(key => {
			let o: any = Reflect.get(this, key);
			return o instanceof TableSet;
		}, this).map(async key => {
			let table = (<TableSet<any>>Reflect.get(this, key));
			table.context = this;
			await table.bind();
			this.tableSetMap.set(table.getEntityType(), table.dbSet);
		}));
	}

	get handler() {
		return this._handler;
	}

	set handler(handler: Handler) {
		this._handler = handler;
		// this._handler.context = this;
	}

	// getEntityPath() {
	// 	return this._entityPath;
	// }

	// setEntityPath(entityPath: string) {
	// 	this._entityPath = entityPath;
	// }

	async execute(query: string | sql.INode, args?: Array<any>): Promise<bean.ResultSet> {
		if (this.connection) {
			return this.connection.run(query, args);
		} else {
			return this.handler.run(query, args);
		}
	}

	flush(): void { }

	async initTransaction(): Promise<Context> {
		// Create Clone
		let res = Object.assign({}, this);
		Object.setPrototypeOf(res, Object.getPrototypeOf(this));
		let keys = Reflect.ownKeys(res);
		keys.forEach((key) => {
			let prop = Reflect.get(res, key);
			if (prop instanceof TableSet) {
				prop.context = res;
			}
		});

		// res.connection = await res.handler.getConnection();
		let nativeConn = await this.handler.getConnection();
		res.connection = new bean.Connection(res.handler, nativeConn);
		await res.connection.initTransaction();
		return res;
	}

	async commit() {
		if (!this.connection) throw new TypeError('Transaction Not Started');
		await this.connection.commit();
		await this.connection.close();
	}

	async rollback() {
		if (!this.connection) throw new TypeError('Transaction Not Started');
		await this.connection.rollback();
		await this.connection.close();
	}

	end() {
		return this.handler.end();
	}

}
