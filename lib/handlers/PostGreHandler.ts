import * as pg from "pg";

import * as util from '../Util';
import * as Handler from "./../Handler";
import * as Query from "./../Query";
import Connection from '../Connection';

class PostGreHandler extends Handler.default {
	driver = null;
	handlerName = 'postgres';
	connectionPool: pg.IPool = null;

	constructor(config: Handler.ConnectionConfig) {
		super();
		this.config = config;
		this.connectionPool = new pg.Pool({
		    user: this.config.username,
		    password: this.config.password,
		    database: this.config.database,
		    host: this.config.hostname,
		    max: this.config.connectionLimit
		});
	}

	getConnection(): Promise<Connection> {
		return new Promise<Connection>((resolve, reject) => {
		    let conn = new pg.Client({
			host: this.config.hostname,
			user: this.config.username,
			password: this.config.password,
			database: this.config.database
		    });
		    conn.connect((err) => {
			return err ?
			    reject(err) :
			    resolve(new Connection(this, conn));
		    });
		});
	}

	getTableInfo(tableName: string): Array<Handler.ColumnInfo> {
		let aDescQuery = "SELECT  " +
		    "    f.attnum AS number,  " +
		    "    f.attname AS field,  " +
		    "    f.attnum,  " +
		    "    f.attnotnull AS notnull,  " +
		    "    pg_catalog.format_type(f.atttypid,f.atttypmod) AS data_type,  " +
		    "    CASE WHEN p.contype   = 'p' THEN true ELSE false END AS primarykey,  " +
		    "    CASE WHEN p.contype   = 'u' THEN true ELSE false END AS uniquekey," +
		    "    CASE WHEN p.contype   = 'f' THEN g.relname       END AS foreignkey," +
		    "    CASE WHEN p.contype   = 'f' THEN p.confkey       END AS foreignkey_fieldnum," +
		    "    CASE WHEN p.contype   = 'f' THEN g.relname       END AS foreignkey," +
		    "    CASE WHEN p.contype   = 'f' THEN p.conkey        END AS foreignkey_connnum," +
		    "    CASE WHEN f.atthasdef = 't' THEN d.adsrc         END AS default " +
		    "FROM pg_attribute f " +
		    "    JOIN pg_class c ON c.oid = f.attrelid  " +
		    "    JOIN pg_type t ON t.oid = f.atttypid  " +
		    "    LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = f.attnum " +
		    "    LEFT JOIN pg_namespace n ON n.oid = c.relnamespace  " +
		    "    LEFT JOIN pg_constraint p ON p.conrelid = c.oid AND f.attnum = ANY (p.conkey)  " +
		    "    LEFT JOIN pg_class AS g ON p.confrelid = g.oid  " +
		    "WHERE c.relkind = 'r'::char  " +
		    "    AND c.relname = '" + tableName +"' " +
		    "    AND f.attnum > 0 ORDER BY number";

		let nRetTableInfo = this.run(aDescQuery);
		let result        = util.deAsync(nRetTableInfo);
		let nRet: Array<Handler.ColumnInfo> = new Array<Handler.ColumnInfo>();

		result.rows.forEach((row) => {
		    let aObj: Handler.ColumnInfo = new Handler.ColumnInfo();
		    let columnType: string = (<string>row["data_type"]).toLowerCase();

		    if (columnType.includes("int")                      ||
			columnType.includes("float")                    ||
			columnType.includes("double")                   ||
			columnType.includes("decimal")                  ||
			columnType.includes("real")                     ||
			columnType.includes("numeric")) {
			aObj.type = "number";
		    }
		    else if (columnType.includes("varchar")             ||
			     columnType.includes("text")                ||
			     columnType.includes("character varying")) {
			aObj.type = "string";
		    }
		    else if(columnType.includes("timestamp") || columnType.includes("date")) {
			aObj.type = "date";
		    }

		    aObj.field      = row["field"];
		    aObj.nullable   = !row["notnull"];
		    aObj.primaryKey = row["primarykey"];
		    aObj.default    = row["default"];
		    //aObj.extra    = ????
		    nRet.push(aObj);
		});
		return nRet;
	}

	async run(query: string | Query.ISqlNode, args?: Array<any>, connection?: Connection): Promise<Handler.ResultSet> {
		let q: string = null;
		if(typeof query === "string") {
		    q = query;
		}
		else if(query instanceof Query.SqlStatement) {
		    q = query.eval(this);
		    args = (query.args == undefined ? [] : query.args);
		}

		let p = new Promise<Handler.ResultSet>((resolve, reject) => {
		    return Promise.resolve<string>(q).then((val) => {
			let r: Handler.ResultSet = new Handler.ResultSet();
			if(connection
			    && connection instanceof Connection
			    && connection.Handler.handlerName == this.handlerName
			    && connection.conn) {
			    val = this.getPostgresPlaceHoldersfromMySQL(val);
			    var nT = connection.conn.query(val, args, function(err, result) {
				if(err) reject(err);
				else {
				    if(result.rowCount)                                      r.rowCount = result.rowCount;
				    if(Array.isArray(result.rows))                           r.rows = result.rows.slice();
                                    if(Array.isArray(result.rows) && result.rows.length > 0) r.id = result.rows[0].id;
				    resolve(r);
				}
			    });
			}
			else {
			    this.connectionPool.connect(function(conErr, conn, done) {
				if(conErr) {
				    reject(conErr);
				}

				conn.query(val, args, function(err, result) {
				    done();
				    if(err) reject(err);
				    else {
					if(result.rows[0] && result.rows[0].id)        r.id = result.rows[0].id;
					if(result.rowCount)                            r.rowCount = result.rowCount;
					if(Array.isArray(result.rows))                 r.rows = result.rows.slice();
				    }
				    resolve(r);
				});
			    });
			}
		    });
		});
		return p;
	}
	
        getPostgresPlaceHoldersfromMySQL(aQueryStr: string) : string {
	    	let nRetQuery: string = "";
		let nParamIndex: number = 1;
		for(let aIndex = 0; aIndex < aQueryStr.length; aIndex++) {
			if(aQueryStr[aIndex] == '?') {
				nRetQuery += ('$' + nParamIndex.toString());
				nParamIndex++;
			}
			else {
				nRetQuery += (aQueryStr[aIndex]);
			}
		}
                if(aQueryStr.includes("insert"))
                        nRetQuery += " RETURNING id ";
		return nRetQuery;
	}
}

export default PostGreHandler;
