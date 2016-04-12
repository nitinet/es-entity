/// <reference path="./../../typings/main/ambient/node/index.d.ts" />
/// <reference path="./../index.ts" />

import * as es from "./../index";

import empContext from "./modal/empContext";

var context = es.loader.load(empContext, __dirname + "/mappings");
context.setConfig(null);
