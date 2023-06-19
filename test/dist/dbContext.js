import * as es from 'es-entity';
import Employee from './model/Employee.js';
class DbContext extends es.Context {
    employees = new es.collection.TableSet(Employee);
}
let dbContext = new DbContext({
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
//# sourceMappingURL=dbContext.js.map