import * as bean from '../bean/index';
import Handler from '../lib/Handler';
import * as sql from '../lib/sql';
export default class OracleDbHandler extends Handler {
    handlerName: string;
    driver: any;
    constructor(config: bean.IConnectionConfig);
    getConnection(): any;
    getTableInfo(tableName: string): Promise<Array<bean.ColumnInfo>>;
    run(query: string | sql.ISqlNode): Promise<bean.ResultSet>;
}
