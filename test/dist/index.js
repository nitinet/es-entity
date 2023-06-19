import dbContext from './dbContext.js';
let emp = await dbContext.employees
    .where(a => a.eq('id', 1))
    .singleOrThrow();
emp.name = 'test1';
await dbContext.employees.update(emp, 'name');
console.log(emp);
//# sourceMappingURL=index.js.map