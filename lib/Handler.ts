import * as Query from "./Query";

export class ConnectionConfig {
	name: string = "";
	handler: string = "";
	driver: any = null;
	connectionLimit = 25;
	hostname: string = "";  // Default Mysql
	username: string = "";
	password: string = "";
	database: string = "";
}

export class ResultSet {
	rowCount: number = 0;
	id: any = null;
	rows: Array<any> = null;
	error: string = null;

	constructor() {
	}
}

export class ColumnInfo {
	field: string = "";
	type: string = "";
	nullable: boolean = false;
	primaryKey: boolean = false;
	default: string = "";
	extra: string = "";
}

abstract class Handler {
	public config: ConnectionConfig;

	abstract getConnection(): any;
	abstract async getTableInfo(tableName: string): Promise<Array<ColumnInfo>>;
	abstract async run(query: string | Query.ISqlNode): Promise<ResultSet>;
}

export default Handler;
