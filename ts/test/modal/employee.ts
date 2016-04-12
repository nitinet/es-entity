import * as es from "./../../index";

export default class extends es.entity {
    constructor() {
        super();
    }

    id: es.field;
    name: es.field;
    description: es.field;
}