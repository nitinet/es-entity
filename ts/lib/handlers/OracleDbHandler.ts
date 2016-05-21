import Handler, {ResultSet} from "./../Handler";
import * as Query from "./../Query";

class OracleDbHandler extends Handler {
    init(): void {
    }

    getConnection(): any {
        return null;
    }

    run(query: string | Query.ISqlNode): Promise<ResultSet> {
        return null
    }
}

export default OracleDbHandler;
