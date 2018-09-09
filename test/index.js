"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const es = require("./../dist/index");
const EmpContext_1 = require("./modal/EmpContext");
var config = {
    handler: es.bean.HandlerType.Mysql,
    hostname: 'localhost',
    username: 'root',
    password: '123456',
    database: 'entity-test'
};
var context = new EmpContext_1.default(config);
let q = 4;
async function run() {
    await context.init();
    console.log('[INIT]');
    let trans = await context.initTransaction();
    console.log('[SELECT]');
    let emp = await trans.employees.get(1);
    console.log('id: ' + emp.id + ', name: ' + emp.name + ', desc: ' + emp.description);
    emp.description.set('test update 2');
    emp = await trans.employees.update(emp);
    console.log('id: ' + emp.id + ', name: ' + emp.name + ', desc: ' + emp.description);
    console.log('[UPDATE]');
    let newEmp = trans.employees.getEntity();
    newEmp.name.set('name 2');
    newEmp.appId.set(1);
    newEmp.description.set('desc insert 232432323');
    emp = await trans.employees.insert(newEmp);
    console.log('[INSERTION]');
    console.log('id: ' + emp.id + ', name: ' + emp.name + ', desc: ' + emp.description);
    console.log('[DELETION]');
    await trans.commit();
    console.log('[SELECT CONDITIONAL]');
    await context.employees.delete(emp);
    let empList = await context.employees.where((a) => {
        return (a.id.lt(q)).or(a.id.eq(2));
    }).list();
    for (let i = 0; i < empList.length; i++) {
        let j = empList[i];
        console.log('id: ' + j.id + ', desc: ' + j.description);
    }
    console.log('[TEST COMPLETE]');
    emp = await trans.employees.get(1);
    let app = await emp.application.unique();
    console.log('appId: ' + app.id);
    process.exit(0);
}
run();
