/// <reference path="/usr/local/lib/typings/index.d.ts" />

import * as mysql from "mysql";

import * as Handler from "./../Handler";
import * as Query from "./../Query";
import Connection from '../Connection';

class MysqlHandler extends Handler.default {
	handlerName = 'mysql';
	connectionPool: mysql.IPool = null;

	constructor(config: Handler.ConnectionConfig) {
		super();
		this.config = config;
		this.connectionPool = mysql.createPool({
			connectionLimit: this.config.connectionLimit,
			host: this.config.hostname,
			user: this.config.username,
			password: this.config.password,
			database: this.config.database
		});
	}

	getConnection(): Promise<Connection> {
		let p = new Promise<Connection>((resolve, reject) => {
			let conn = mysql.createConnection({
				host: this.config.hostname,
				user: this.config.username,
				password: this.config.password,
				database: this.config.database
			});
			conn.connect((err) => {
				if (err)
					reject(err);
				else {
					let res = new Connection(this, conn);
					resolve(res);
				}
			});
		});
		return p;
	}

	openConnetion(conn): Promise<any> {
		let p = new Promise((resolve, reject) => {
			conn = mysql.createConnection({
				host: this.config.hostname,
				user: this.config.username,
				password: this.config.password,
				database: this.config.database
			});
			conn.connect((err) => {
				if (err)
					reject(err);
				else
					resolve(conn);
			});
		});
		return p;
	}

	initTransaction(conn): Promise<void> {
		let p = new Promise<void>((resolve, reject) => {
			(<mysql.IConnection>conn).beginTransaction((err) => {
				if (err)
					reject('Initializing Transaction Failed');
				else
					resolve();
			});
		});
		return p;
	}

	commit(conn): Promise<void> {
		let p = new Promise<void>((resolve, reject) => {
			(<mysql.IConnection>conn).commit((err) => {
				if (err)
					reject('Initializing Transaction Failed');
				else
					resolve();
			});
		});
		return p;
	}

	rollback(conn): Promise<void> {
		let p = new Promise<void>((resolve) => {
			(<mysql.IConnection>conn).rollback(() => {
				resolve();
			});
		});
		return p;
	}

	close(conn): Promise<void> {
		let p = new Promise<void>((resolve, reject) => {
			(<mysql.IConnection>conn).end((err) => {
				if (err)
					reject('Initializing Transaction Failed');
				else
					resolve();
			});
		});
		return p;
	}

	async getTableInfo(tableName: string): Promise<Array<Handler.ColumnInfo>> {
		let r = await this.run("describe " + tableName);
		let result: Array<Handler.ColumnInfo> = new Array<Handler.ColumnInfo>();
		r.rows.forEach((row) => {
			let a: Handler.ColumnInfo = new Handler.ColumnInfo();
			a.field = row["Field"];
			let columnType: string = (<string>row["Type"]).toLowerCase();
			if (columnType.includes("tinyint(1)")) {
				a.type = "boolean";
			} else if (columnType.includes("int")
				|| columnType.includes("float")
				|| columnType.includes("double")
				|| columnType.includes("decimal")) {
				a.type = "number";
			} else if (columnType.includes("varchar")
				|| columnType.includes('text')) {
				a.type = "string";
			} else if (columnType.includes("timestamp")) {
				a.type = "date";
			}

			a.nullable = row["Null"] == "YES" ? true : false;
			a.primaryKey = (<string>row["Key"]).indexOf("PRI") >= 0 ? true : false;
			a.default = row["Default"];
			a.extra = row["Extra"];
			result.push(a);
		});
		return result;
	}

	async run(query: string | Query.ISqlNode, connection?: Connection): Promise<Handler.ResultSet> {
		let q: string = null;
		let args: Array<any> = null;
		if (typeof query === "string") {
			q = query;
		} else if (query instanceof Query.SqlStatement) {
			q = query.eval(this);
			args = query.args;
		}

		let p = new Promise<Handler.ResultSet>((resolve, reject) => {
			return Promise.resolve<string>(q).then((val) => {
				// console.log("query:" + val);
				/* for (let i = 0; i < args.length; i++) {
						console.log("Argument: " + args[i]);
				}*/

				let r: Handler.ResultSet = new Handler.ResultSet();
				if (connection && connection instanceof Connection && connection.Handler.handlerName == this.handlerName) {
					(<mysql.IConnection>connection.Conn).query(val, args, function (err, result) {
						if (err)
							reject(err.code);
						else {
							if (result.insertId)
								r.id = result.insertId;
							if (result.changedRows) {
								r.rowCount = result.changedRows;
							} else if (Array.isArray(result)) {
								r.rows = <Array<any>>result;
								r.rowCount = (<Array<any>>result).length;
							}
						}
						resolve(r);
					});
				} else {
					this.connectionPool.query(val, args, function (err, result) {
						if (err)
							reject(err.code);
						else {
							if (result.insertId)
								r.id = result.insertId;
							if (result.changedRows) {
								r.rowCount = result.changedRows;
							} else if (Array.isArray(result)) {
								r.rows = <Array<any>>result;
								r.rowCount = (<Array<any>>result).length;
							}
						}
						resolve(r);
					});
				}
			});
		});
		return p;
	}

}

export default MysqlHandler;