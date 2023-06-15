import 'reflect-metadata';

import * as bean from './bean/index.js';
import * as collection from './collection/index.js';
import * as decorators from './decorators/index.js';
import * as handlers from './handlers/index.js';
import * as sql from './sql/index.js';
import * as types from './model/types.js';
import * as model from './model/index.js';
import Context from './Context.js';

export default {
	types,
	model,
	Context,
	collection,
	decorators,
	sql,
	bean,
	handlers
};

export {
	types,
	model,
	Context,
	collection,
	decorators,
	sql,
	bean,
	handlers
};
