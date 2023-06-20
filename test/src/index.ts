import dbContext from './dbContext.js';

let emp = await dbContext.employees
	.where(a => a.eq('id', 1))
	.singleOrThrow();

emp.name = 'test1';

await dbContext.employees.update(emp, 'name');

console.log(emp);

// Test mssql
// import mssql from 'mssql';

// const config = {
// 	user: '...',
// 	password: '...',
// 	server: 'localhost', // You can use 'localhost\\instance' to connect to named instance
// 	database: '...',
// }

// let pool = await mssql.connect(config)
// let result1 = await pool.request().query('select * from mytable where id = 1');

// console.dir(result1);

// import sqlite from 'sqlite3';

// const db: sqlite.Database = await new Promise((res, rej) => {
// 	let temp = new sqlite.Database('/Users/nitinbansal/testdb', (err) => {
// 		if (err) rej(err);
// 	});
// 	res(temp);
// });

// let res = await new Promise<any>((resolve, reject) => {
// 	db.all('INSERT INTO employee(name, age)VALUES("test3", 20)', function (err: Error, r: any) {
// 		if (err) { reject(err); }
// 		else { resolve(r); }
// 	});
// });

// console.log(res);
