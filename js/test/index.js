/// <reference path="./../index.ts" />
"use strict";
const es = require("./../index");
const EmpContext_1 = require("./modal/EmpContext");
var config = new es.ConnectionConfig();
config.handler = "mysql";
config.hostname = "localhost";
config.name = "mysql";
config.username = "root";
config.password = "Application~";
config.database = "test";
var context = new EmpContext_1.default();
context.bind(config, __dirname + "/mappings");
let p = context.employees.get(1);
p.then((v) => {
    console.log("id: " + v.id + ", name: " + v.name + ", desc: " + v.description);
});
