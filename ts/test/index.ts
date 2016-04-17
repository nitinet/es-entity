/// <reference path="./../../typings/main/ambient/node/index.d.ts" />
/// <reference path="./../index.ts" />

import * as es from "./../index";

import empContext from "./modal/EmpContext";

var context = new empContext(null, __dirname + "/mappings");
context.bind();

