import * as bean from '../bean/index.js';
import Handler from './Handler.js';
const pgDriver = await import('pg');
const pgQueryStream = await import('pg-query-stream');
export default class PostgreSql extends Handler {
    connectionPool;
    constructor(config) {
        super(config);
        this.connectionPool = new pgDriver.Pool({
            user: this.config.username,
            password: this.config.password,
            database: this.config.database,
            host: this.config.host,
            port: this.config.port,
            max: this.config.connectionLimit
        });
    }
    async init() { }
    async getConnection() {
        let conn = await this.connectionPool.connect();
        return conn;
    }
    async initTransaction(conn) {
        await conn.query('BEGIN');
    }
    async commit(conn) {
        await conn.query('COMMIT');
    }
    async rollback(conn) {
        await conn.query('ROLLBACK');
    }
    async close(conn) {
        conn.release();
    }
    async end() {
    }
    async run(queryStmt, connection) {
        let { query, dataArgs } = this.prepareQuery(queryStmt);
        query = this.convertPlaceHolder(query);
        let temp;
        if (connection) {
            temp = await connection.query(query, dataArgs);
        }
        else {
            let con = await this.connectionPool.connect();
            try {
                temp = await con.query(query, dataArgs);
            }
            finally {
                con.release();
            }
        }
        let result = new bean.ResultSet();
        result.rowCount = temp.rowCount ?? 0;
        result.rows = temp.rows;
        return result;
    }
    async stream(queryStmt, connection) {
        let { query, dataArgs } = this.prepareQuery(queryStmt);
        query = this.convertPlaceHolder(query);
        const queryStream = new pgQueryStream.default(query, dataArgs);
        let stream;
        if (connection) {
            stream = connection.query(queryStream);
        }
        else {
            let con = await this.connectionPool.connect();
            stream = con.query(queryStream);
            stream.on('end', () => {
                con.release();
            });
        }
        return stream;
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