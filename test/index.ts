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
var context = new empContext(config);

let q = 4;

async function run() {
	await context.init();
	let v = await context.employees.get(1);
	console.log("id: " + v.id + ", name: " + v.name + ", desc: " + v.description);
	v.description.set("test update 2");
	v = await context.employees.update(v);
	console.log("id: " + v.id + ", name: " + v.name + ", desc: " + v.description);
	console.log("updated");
	let a = context.employees.getEntity();
	a.name.set("name 2");
	a.description.set("desc insert 2");
	v = await context.employees.insert(a);
	console.log("inserted");
	console.log("id: " + v.id + ", name: " + v.name + ", desc: " + v.description);
	await context.employees.delete(v);
	console.log("deleted");
	let q = await context.employees.where((a) => {
		return a.name.IsNull();
		// return (a.id.lt(q)).or(a.id.eq(2));
	}).list();
	for (let i = 0; i < q.length; i++) {
		let j = q[i];
		console.log("id: " + j.id + ", desc: " + j.description);
	}
}

run();
