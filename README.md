es-entity
===================

ORM framework for Node js based on Ecmascript 6 and Typescript.


### Contributors

Nitin Bansal https://github.com/nitinbansal1989

## Installation

    $ npm install es-entity

## Usage
Create DB context and provide connection configuration.

```js
const es = require("es-entity");
```

### Entity Class
Entity class is the reference to the table in the database. The property in this class are field objects which refers to the columns of the table.

Note: The class members are camel cased from the snake case database columns. Annotation for custom column name will be implemented in future.

```js
class Employee {
    constructor() {
        this.id = new es.Number();
        this.name = new es.String();
        this.description = new es.String();
    }
}
```

### DB Configuration
Context is provided with the connection parameters of the database to connect.

```js
var config = new es.ConnectionConfig();
config.handler = "mysql";
config.hostname = "localhost";
config.name = "mysql";
config.username = "root";
config.password = "application";
config.database = "test";
```

### Context
Context class is created which extends from es.Context. This class works as database context for all your queries. The property in this class as queryable object to the respective classes. 

```js
const Employee_1 = require("./Employee");
class EmpContext extends es.Context {
    constructor(config, entityPath) {
        super(config, entityPath);
        this.employees = new es.DBSet(Employee_1.default);
        this.init();
    }
}
```

Provide the database config object and mapping folder object to the context object to bind.

```js
const EmpContext_1 = require("./modal/EmpContext");
var context = new EmpContext_1.default(config);
```

## Operations

### Select Entities

```js
let p = context.employees.where((a) => {
    return (a.id.lt(q)).or(a.id.eq(2));
}).list();

p.then((v) => {
    for (var i = 0; i < v.length; i++) {
        var j = v[i];
        console.log("id: " + j.id + ", name: " + j.name + ", desc: " + j.description);
    }
});
```

### Select Entity By Id
```js
let p = context.employees.get(1);

p.then((v) => {
    console.log("id: " + v.id + ", name: " + v.name + ", desc: " + v.description);
});
```

### Updating Entity
```js
v.description.set("test update 2");
let p = context.employees.update(v);
p.then((v) => {
    console.log("id: " + v.id + ", name: " + v.name + ", desc: " + v.description);
    console.log("updated");
});
```

### Inserting Entity
```js
let a = context.employees.getEntity();
a.name.set("name 2");
a.description.set("desc insert 2");
let p = context.employees.insert(a);
p.then((v) => {
    console.log("id: " + v.id + ", name: " + v.name + ", desc: " + v.description);
    console.log("inserted");
});
```

### Deleting Entity
```js
let p = context.employees.delete(v);
p.then(() => {
    console.log("deleted");
});
```

Note: Currently it is very basic and only supports mysql. Please provide suggestions if any.
