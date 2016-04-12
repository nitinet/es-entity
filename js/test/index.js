/// <reference path="./../../typings/main/ambient/node/index.d.ts" />
/// <reference path="./../index.ts" />
"use strict";
const es = require("./../index");
const empContext_1 = require("./modal/empContext");
var context = es.loader.load(empContext_1.default, __dirname + "/mappings");
context.setConfig(null);
