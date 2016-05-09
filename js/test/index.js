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
let p = context.employees.get(2);
p.then((v) => {
    console.log("id: " + v.id + ", name: " + v.name + ", desc: " + v.description);
    v.description = "test update 1";
    return context.employees.update(v);
}).then((v) => {
    console.log("id: " + v.id + ", name: " + v.name + ", desc: " + v.description);
    console.log("updated");
    let a = context.employees.getEntity();
    a.name = "name 2";
    a.description = "desc insert 2";
    return context.employees.insert(a);
}).then((v) => {
    console.log("inserted");
    console.log("id: " + v.id + ", name: " + v.name + ", desc: " + v.description);
    context.employees.delete(v);
}).then(() => {
    console.log("deleted");
});
