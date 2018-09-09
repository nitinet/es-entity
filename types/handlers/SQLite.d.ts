import * as bean from '../bean';
import Handler from '../lib/Handler';
import * as sql from '../lib/sql';
export default class SQlite extends Handler {
    handlerName: string;
    driver: any;
    constructor(config: bean.IConnectionConfig);
    getConnection(): any;
    getTableInfo(tableName: string): Promise<Array<bean.ColumnInfo>>;
    run(query: string | sql.INode): Promise<bean.ResultSet>;
}
