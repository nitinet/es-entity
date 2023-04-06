import * as bean from '../bean/index.js';
import Handler from './Handler.js';
export default class Mysql extends Handler {
    handlerName = 'mysql';
    driver;
    connectionPool;
    constructor(config) {
        super(config);
        this.serializeMap.set(bean.ColumnType.OBJECT, (val) => JSON.stringify(val));
        this.deSerializeMap.set(bean.ColumnType.OBJECT, (val) => JSON.parse(val));
        this.serializeMap.set(bean.ColumnType.BOOLEAN, (val) => val ? '1' : '0');
        this.deSerializeMap.set(bean.ColumnType.BOOLEAN, (val) => val == '1');
    }
    async init() {
        this.driver = this.config.driver ?? await import('mysql');
        this.connectionPool = this.driver.createPool({
            connectionLimit: this.config.connectionLimit,
            host: this.config.host,
            port: this.config.port,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });
    }
    getConnection() {
        let that = this;
        return new Promise((resolve, reject) => {
            let conn = that.driver.createConnection({
                host: that.config.host,
                port: that.config.port,
                user: that.config.username,
                password: that.config.password,
                database: that.config.database
            });
            conn.connect((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(conn);
                }
            });
        });
    }
    initTransaction(conn) {
        return new Promise((resolve, reject) => {
            conn.beginTransaction((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    commit(conn) {
        return new Promise((resolve, reject) => {
            conn.commit((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    rollback(conn) {
        return new Promise((resolve) => {
            conn.rollback(() => {
                resolve();
            });
        });
    }
    close(conn) {
        return new Promise((resolve, reject) => {
            conn.end((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async end() { }
    async getTableInfo(tableName) {
        let r = await this.run('describe ' + tableName);
        let result = new Array();
        r.rows.forEach((row) => {
            let col = new bean.ColumnInfo();
            col.field = row['Field'];
            let columnType = row['Type'].toLowerCase();
            if (columnType.includes('tinyint(1)')) {
                col.type = bean.ColumnType.BOOLEAN;
            }
            else if (columnType.includes('int')
                || columnType.includes('real')
                || columnType.includes('float')
                || columnType.includes('double')
                || columnType.includes('decimal')) {
                col.type = bean.ColumnType.NUMBER;
            }
            else if (columnType.includes('varchar')
                || columnType.includes('text')
                || columnType == 'time') {
                col.type = bean.ColumnType.STRING;
            }
            else if (columnType.includes('timestamp')
                || columnType.includes('date')) {
                col.type = bean.ColumnType.DATE;
            }
            else if (columnType.includes('blob')
                || columnType.includes('binary')) {
                col.type = bean.ColumnType.BINARY;
            }
            else if (columnType.includes('json')) {
                col.type = bean.ColumnType.OBJECT;
            }
            else {
                throw new Error(`Invalid Column Type ${columnType} in table ${tableName}`);
            }
            col.nullable = row['Null'] == 'YES' ? true : false;
            col.primaryKey = row['Key'].indexOf('PRI') >= 0 ? true : false;
            col.default = row['Default'];
            col.extra = row['Extra'];
            result.push(col);
        });
        return result;
    }
    async run(query, args, connection) {
        let queryObj = this.prepareQuery(query, args);
        let temp = null;
        if (connection) {
            temp = await new Promise((resolve, reject) => {
                connection.query(queryObj.query, queryObj.args, function (err, r) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(r);
                    }
                });
            });
        }
        else {
            temp = await new Promise((resolve, reject) => {
                this.connectionPool.query(queryObj.query, queryObj.args, function (err, r) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(r);
                    }
                });
            });
        }
        let result = new bean.ResultSet();
        if (temp.insertId)
            result.id = temp.insertId;
        if (temp.changedRows) {
            result.rowCount = temp.changedRows;
        }
        else if (Array.isArray(temp)) {
            result.rows = temp;
            result.rowCount = temp.length;
        }
        return result;
    }
}
//# sourceMappingURL=Mysql.js.map