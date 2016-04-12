import * as es from "./../../index";
import employee from "./employee";

export default class extends es.context {

    employees: es.queryable = new es.queryable(employee);
}