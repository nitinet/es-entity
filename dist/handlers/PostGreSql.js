import * as bean from '../bean/index.js';
import * as sql from '../sql/index.js';
import Handler from './Handler.js';
export default class PostgreSql extends Handler {
    handlerName = 'postgresql';
    driver;
    connectionPool;
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
    async run(queryStmt, connection) {
        let query;
        let dataArgs = [];
        if (Array.isArray(queryStmt)) {
            let tempQueries = [];
            queryStmt.forEach(a => {
                if (!(a instanceof sql.Statement))
                    throw new Error('Invalid Statement');
                tempQueries.push(a.eval(this));
                dataArgs.push(...a.args);
            });
            query = tempQueries.join('; ');
        }
        else if (queryStmt instanceof sql.Statement) {
            query = queryStmt.eval(this);
            dataArgs.push(...queryStmt.args);
        }
        else {
            query = queryStmt;
        }
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
        result.rowCount = temp.rowCount;
        result.rows = temp.rows;
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