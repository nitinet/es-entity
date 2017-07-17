"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("../Util");
const Handler = require("./../Handler");
const Connection_1 = require("../Connection");
class MsSqlServerHandler extends Handler.default {
    constructor(config) {
        super();
        this.handlerName = 'mssql';
        this.connectionPool = null;
        this.driver = null;
        this.driver = require('mssql');
        this.config = config;
        this.connectionPool = util.deAsync(this.driver.connect({
            server: this.config.hostname,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        }));
    }
    async getConnection() {
        try {
            let conn = await this.driver.connect({
                server: this.config.hostname,
                user: this.config.username,
                password: this.config.password,
                database: this.config.database
            });
            return new Connection_1.default(this, conn);
        }
        catch (e) {
            throw e;
        }
    }
    getTableInfo(tableName) {
        let p = this.run("describe " + tableName);
        let r = util.deAsync(p);
        let result = new Array();
        r.rows.forEach((row) => {
            let a = new Handler.ColumnInfo();
            a.field = row["Field"];
            let columnType = row["Type"].toLowerCase();
            if (columnType.includes("tinyint(1)")) {
                a.type = "boolean";
            }
            else if (columnType.includes("int")
                || columnType.includes("float")
                || columnType.includes("double")
                || columnType.includes("decimal")) {
                a.type = "number";
            }
            else if (columnType.includes("varchar")
                || columnType.includes('text')) {
                a.type = "string";
            }
            else if (columnType.includes("timestamp")) {
                a.type = "date";
            }
            a.nullable = row["Null"] == "YES" ? true : false;
            a.primaryKey = row["Key"].indexOf("PRI") >= 0 ? true : false;
            a.default = row["Default"];
            a.extra = row["Extra"];
            result.push(a);
        });
        return result;
    }
    async run(query) {
        return null;
    }
}
exports.default = MsSqlServerHandler;
