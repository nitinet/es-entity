import * as bean from '../bean/index.js';
import Handler from './Handler.js';

async function getHandler(config: bean.IConnectionConfig) {
  let handler: Handler;
  switch (config.handler) {
    case bean.HandlerType.mysql:
      handler = new (await import('./Mysql.js')).default(config);
      break;

    case bean.HandlerType.oracle:
      handler = new (await import('./Oracle.js')).default(config);
      break;

    case bean.HandlerType.postgresql:
      handler = new (await import('./PostGreSql.js')).default(config);
      break;

    case bean.HandlerType.mssql:
      handler = new (await import('./MsSqlServer.js')).default(config);
      break;

    case bean.HandlerType.sqlite:
      handler = new (await import('./SQLite.js')).default(config);
      break;

    default:
      throw new Error('No Handler Found');
  }
  return handler;
}

export default getHandler;
