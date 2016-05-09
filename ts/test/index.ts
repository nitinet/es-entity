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
