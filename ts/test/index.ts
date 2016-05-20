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
    console.log("id: " + v.id.val + ", name: " + v.name.val + ", desc: " + v.description.val);
    v.description.val = "test update 2";
    return context.employees.update(v);
}).then((v) => {
    console.log("id: " + v.id.val + ", name: " + v.name.val + ", desc: " + v.description.val);
    console.log("updated");
    let a = context.employees.getEntity();
    a.name.val = "name 2";
    a.description.val = "desc insert 2";
    return context.employees.insert(a);
}).then((v) => {
    console.log("inserted");
    console.log("id: " + v.id.val + ", name: " + v.name.val + ", desc: " + v.description.val);
    context.employees.delete(v);
}).then(() => {
    console.log("deleted");
}).then(() => {
    return context.employees.where((a) => {
        return (a.id.eq(1)).or(a.id.eq(2));
    });
}).then((v) => {
    for (var i = 0; i < v.length; i++) {
        var j = v[i];
        console.log("id: " + j.id.val + ", name: " + j.name.val + ", desc: " + j.description.val);
    }
});
