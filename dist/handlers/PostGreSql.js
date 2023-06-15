import * as bean from '../bean/index.js';
import Handler from './Handler.js';
export default class PostgreSql extends Handler {
    handlerName = 'postgresql';
    driver;
    connectionPool;
    constructor(config) {
        super(config);
        this.serializeMap.set(bean.ColumnType.OBJECT, (val) => JSON.stringify(val));
        this.deSerializeMap.set(bean.ColumnType.OBJECT, (val) => JSON.parse(val));
        this.serializeMap.set(bean.ColumnType.ARRAY, (val) => `{${val.join(',')}}`);
        this.deSerializeMap.set(bean.ColumnType.ARRAY, (val) => val.replace('{', '').replace('}', '').split(','));
    }
    async init() {
        this.driver = this.config.driver ?? (await import('pg')).native ?? await import('pg');
        this.connectionPool = new this.driver.Pool({
            user: this.config.username,
            password: this.config.password,
            database: this.config.database,
            host: this.config.host,
            port: this.config.port,
            max: this.config.connectionLimit
        });
    }
    async getConnection() {
        let conn = new this.driver.Client({
            host: this.config.host,
            port: this.config.port,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });
        await conn.connect();
        return conn;
    }
    async initTransaction(conn) { await conn.query('BEGIN'); }
    async commit(conn) { await conn.query('COMMIT'); }
    async rollback(conn) { await conn.query('ROLLBACK'); }
    async close(conn) { await conn.end(); }
    async end() { }
    async run(query, args, connection) {
        let queryObj = this.prepareQuery(query, args);
        let temp = null;
        if (connection) {
            temp = await connection.query(queryObj.query, queryObj.args);
        }
        else {
            let con = null;
            try {
                con = await this.connectionPool.connect();
                temp = await con.query(queryObj.query, queryObj.args);
            }
            finally {
                if (con) {
                    con.release();
                }
            }
        }
        let result = new bean.ResultSet();
        if (temp.rowCount)
            result.rowCount = temp.rowCount;
        if (Array.isArray(temp.rows))
            result.rows = temp.rows;
        if (result.rows && result.rows.length > 0)
            result.id = result.rows[0].id;
        return result;
    }
    convertPlaceHolder(query) {
        let i = 1;
        while (query.includes('?')) {
            query = query.replace('?', `$${i}`);
            i++;
        }
        return query;
    }
    limit(size, index) {
        return ' limit ' + size + (index ? ' OFFSET ' + index : '');
    }
}
//# sourceMappingURL=PostGreSql.js.map