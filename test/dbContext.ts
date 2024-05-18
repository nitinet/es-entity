import * as es from '../index.js';

import Employee from './model/Employee.js';

class DbContext extends es.Context {
  employees = new es.collection.TableSet(Employee);
}

const dbContext = new DbContext({
  dbConfig: {
    handler: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: 'P@ssw0rd',
    database: 'test'
  }
});

await dbContext.init();

export default dbContext;
