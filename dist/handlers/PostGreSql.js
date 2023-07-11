import * as bean from '../bean/index.js';
import Handler from './Handler.js';
export default class PostgreSql extends Handler {
    handlerName = 'postgresql';
    driver;
    connectionPool;
    constructor(config) {
        super(config);
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
        let conn = await this.connectionPool.connect();
        return conn;
    }
    async initTransaction(conn) { await conn.query('BEGIN'); }
    async commit(conn) {
        await conn.query('COMMIT');
    }
    async rollback(conn) {
        await conn.query('ROLLBACK');
    }
    async close(conn) { conn.release(); }
    async end() { }
    async run(query, args, connection) {
        let queryObj = this.prepareQuery(query, args);
        let temp;
        if (connection) {
            temp = await connection.query(queryObj.query, queryObj.args);
        }
        else {
            let con = await this.connectionPool.connect();
            try {
                temp = await con.query(queryObj.query, queryObj.args);
            }
            finally {
                con.release();
            }
        }
        let result = new bean.ResultSet();
        result.rowCount = temp.rowCount;
        result.rows = temp.rows;
        return result;
    }
    convertPlaceHolder(query) {
        for (let i = 0; i >= 0 && query.includes('?'); i++)
            query = query.replace('?', `$${i}`);
        return query;
    }
    limit(size, index) {
        return ' limit ' + size + (index ? ' OFFSET ' + index : '');
    }
}
//# sourceMappingURL=PostGreSql.js.map