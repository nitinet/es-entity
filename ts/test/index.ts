/// <reference path="./../index.ts" />

import * as es from "./../index";

import empContext from "./modal/EmpContext";

var config: es.ConnectionConfig = new es.ConnectionConfig();
config.handler = "mysql";
config.hostname = "localhost";
config.name = "mysql";
config.username = "root";
config.password = "Application~";
config.database = "test";
var context = new empContext();
context.bind(config, __dirname + "/mappings");

let p = context.employees.get(1);
p.then((v) => {
    console.log("id: " + v.id + ", name: " + v.name + ", desc: " + v.description);
});
