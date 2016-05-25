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

```js
class Employee {
    constructor() {
        this.id = new es.Field();
        this.name = new es.Field();
        this.description = new es.Field();
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

### Mapping
The json mapping of each class is provided to the context. All mapping files are placed inside a folder and the folder path is binded to the context. The mapping file name should be like : 'Entity Class Name'.json

Eg: Employee.json

```js
{
    "name": "employee",
    "entityName": "employee",
    "primaryKey": "id",
    "fields": [
        {
            "name": "id",
            "fieldName": "id",
            "type": "int"
        },
        {
            "name": "name",
            "fieldName": "name",
            "type": "string"
        },
        {
            "name": "description",
            "fieldName": "description",
            "type": "string"
        }
    ]
}
```

### Context
Context class is created which extends from es.Context. This class works as database context for all your queries. The property in this class as queryable object to the respective classes. 

```js
const Employee_1 = require("./Employee");
class EmpContext extends es.Context {
    constructor() {
        super();
        this.employees = new es.DBSet(Employee_1.default);
    }
}
```

Provide the database config object and mapping folder object to the context object to bind.

```js
const EmpContext_1 = require("./modal/EmpContext");
var context = new EmpContext_1.default();
context.bind(config, __dirname + "/mappings");
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
        console.log("id: " + j.id.val + ", name: " + j.name.val + ", desc: " + j.description.val);
    }
});
```

### Select Entity By Id
```js
let p = context.employees.get(1);

p.then((v) => {
    console.log("id: " + v.id.val + ", name: " + v.name.val + ", desc: " + v.description.val);
});
```

### Updating Entity
```js
v.description.val = "test update 2";
let p = context.employees.update(v);
p.then((v) => {
    console.log("id: " + v.id.val + ", name: " + v.name.val + ", desc: " + v.description.val);
    console.log("updated");
});
```

### Inserting Entity
```js
let a = context.employees.getEntity();
a.name.val = "name 2";
a.description.val = "desc insert 2";
let p = context.employees.insert(a);
p.then((v) => {
    console.log("id: " + v.id.val + ", name: " + v.name.val + ", desc: " + v.description.val);
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
