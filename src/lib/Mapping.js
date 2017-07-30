"use strict";
exports.__esModule = true;
var FieldMapping = (function () {
    function FieldMapping(data) {
        this.name = null;
        this.type = null;
        Object.assign(this, data);
    }
    return FieldMapping;
}());
exports.FieldMapping = FieldMapping;
var EntityMapping = (function () {
    function EntityMapping(data) {
        var _this = this;
        this.name = "";
        this.entityName = "";
        this.primaryKey = "";
        this.primaryKeyField = null;
        this.fields = new Map();
        if (data) {
            this.name = data.name;
            this.entityName = data.entityName;
            this.primaryKey = data.primaryKey;
            Reflect.ownKeys(data.fields).forEach(function (key) {
                var val = data.fields[key];
                _this.fields.set(key, new FieldMapping(val));
            });
            this.primaryKeyField = this.fields.get(this.primaryKey);
        }
    }
    return EntityMapping;
}());
exports.EntityMapping = EntityMapping;
