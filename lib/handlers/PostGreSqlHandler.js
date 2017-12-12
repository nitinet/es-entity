"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const util = require("../Util");
const Handler = require("./../Handler");
const Query = require("./../Query");
const Connection_1 = require("../Connection");
class PostGreHandler extends Handler.default {
    constructor(config) {
        super();
        this.driver = null;
        this.handlerName = 'postgresql';
        this.connectionPool = null;
        this.driver = require('pg');
        this.config = config;
        this.connectionPool = new this.driver.Pool({
            user: this.config.username,
            password: this.config.password,
            database: this.config.database,
            host: this.config.hostname,
            max: this.config.connectionLimit
        });
    }
    async getConnection() {
        let conn = new this.driver.Client({
            host: this.config.hostname,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });
        try {
            await conn.connect();
            return new Connection_1.default(this, conn);
        }
        catch (err) {
            throw err;
        }
    }
    async initTransaction(conn) { await conn.query('BEGIN'); }
    async commit(conn) { await conn.query('COMMIT'); }
    async rollback(conn) { await conn.query('ROLLBACK'); }
    async close(conn) { conn.release(); }
    getTableInfo(tableName) {
        let describeTableQuery = fs.readFileSync(__dirname + '/../../assets/postgresql_describe_query.sql', 'utf-8');
        let descQuery = describeTableQuery.replace('?', tableName);
        let tableInfo = util.deAsync(this.run(descQuery));
        let result = new Array();
        tableInfo.rows.forEach((row) => {
            let obj = new Handler.ColumnInfo();
            obj.field = row["field"];
            let columnType = row["data_type"].toLowerCase();
            if (columnType.includes("boolean")) {
                obj.type = "boolean";
            }
            else if (columnType.includes("int") ||
                columnType.includes("float") ||
                columnType.includes("double") ||
                columnType.includes("decimal") ||
                columnType.includes("real") ||
                columnType.includes("numeric")) {
                obj.type = "number";
            }
            else if (columnType.includes("varchar") ||
                columnType.includes("text") ||
                columnType.includes("character varying") ||
                columnType.includes("uuid")) {
                obj.type = "string";
            }
            else if (columnType.includes("timestamp") || columnType.includes("date")) {
                obj.type = "date";
            }
            obj.nullable = !row["notnull"];
            obj.primaryKey = row["primarykey"];
            obj.default = row["default"];
            result.push(obj);
        });
        return result;
    }
    async run(query, args, connection) {
        let q = null;
        if (typeof query === "string") {
            q = query;
        }
        else if (query instanceof Query.SqlStatement) {
            q = query.eval(this);
            args = (query.args == undefined ? [] : query.args);
        }
        let result = new Handler.ResultSet();
        let con = null;
        if (connection && connection instanceof Connection_1.default && connection.Handler.handlerName == this.handlerName && connection.conn) {
            con = connection.conn;
        }
        else {
            con = this.connectionPool;
        }
        let p = new Promise((resolve, reject) => {
            con.query(q, args, (err, response) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(response);
                }
            });
        });
        let r = await p;
        if (r.rowCount)
            result.rowCount = r.rowCount;
        if (Array.isArray(r.rows))
            result.rows = r.rows.slice();
        if (Array.isArray(r.rows) && r.rows.length > 0)
            result.id = r.rows[0].id;
        return result;
    }
    convertPlaceHolder(query) {
        for (let i = 1; query.includes('?'); i++) {
            query = query.replace('?', '$' + i);
        }
        return query;
    }
    insertQuery(collection, columns, values) {
        return super.insertQuery(collection, columns, values) + ' returning id';
    }
}
exports.default = PostGreHandler;
