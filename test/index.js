"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const es = require("./../index");
const EmpContext_1 = require("./modal/EmpContext");
var config = new es.ConnectionConfig();
config.handler = "mysql";
config.hostname = "localhost";
config.name = "mysql";
config.username = "root";
config.password = "Application~";
config.database = "test";
var context = new EmpContext_1.default(config, __dirname + "/mappings");
let q = 4;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let v = yield context.employees.get(1);
        console.log("id: " + v.id.val + ", name: " + v.name.val + ", desc: " + v.description.val);
        v.description.val = "test update 2";
        v = yield context.employees.update(v);
        console.log("id: " + v.id.val + ", name: " + v.name.val + ", desc: " + v.description.val);
        console.log("updated");
        let a = context.employees.getEntity();
        a.name.val = "name 2";
        a.description.val = "desc insert 2";
        v = yield context.employees.insert(a);
        console.log("inserted");
        console.log("id: " + v.id.val + ", name: " + v.name.val + ", desc: " + v.description.val);
        yield context.employees.delete(v);
        console.log("deleted");
        let q = yield context.employees.where((a) => {
            return a.name.IsNull();
        }).list();
        for (let i = 0; i < q.length; i++) {
            let j = q[i];
            console.log("id: " + j.id.val + ", name: " + j.name.val + ", desc: " + j.description.val);
        }
    });
}
run();
