enum QueryType {
    statement,
    command,
    columns,
    collection,
    where,
    sets,
    expression
}

class Query {
    type: QueryType = QueryType.statement;
    value: string = "";
    nodes: Array<Query> = new Array();
}

export default Query;
export {QueryType};
