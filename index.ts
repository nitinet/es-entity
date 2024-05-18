import 'reflect-metadata';

import Context from './lib/Context.js';
import * as bean from './lib/bean/index.js';
import * as collection from './lib/collection/index.js';
import * as decorators from './lib/decorators/index.js';
import * as handlers from './lib/handlers/index.js';
import * as model from './lib/model/index.js';
import * as types from './lib/model/types.js';
import * as sql from './lib/sql/index.js';

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

export { Context, bean, collection, decorators, handlers, model, sql, types };
