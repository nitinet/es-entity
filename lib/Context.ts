import { cloneDeep } from 'lodash-es';
import * as bean from './bean/index.js';
import TableSet from './collection/TableSet.js';
import Handler from './handlers/Handler.js';
import getHandler from './handlers/getHandler.js';
import * as types from './model/types.js';
import * as sql from './sql/index.js';

export default class Context {
  private _handler!: Handler;
  private connection: bean.Connection | null = null;
  private logger: any = null;

  public tableSetMap = new Map<types.IEntityType<any>, TableSet<any>>();
  public config: bean.IConfig;

  constructor(config: bean.IConfig) {
    this.config = config;

    if (!this.config.dbConfig) {
      throw new Error('Database Config Not Found');
    }

    this.logger = this.config.logger || console;
  }

  log(...arg: any[]) {
    this.logger.error(arg);
  }

  async init() {
    this._handler = await getHandler(this.config.dbConfig);
    await this._handler.init();

    Reflect.ownKeys(this).forEach(key => {
      let tableSet = Reflect.get(this, key);
      if (!(tableSet instanceof TableSet)) return;

      tableSet.context = this;
      this.tableSetMap.set(tableSet.getEntityType(), tableSet);
    });
  }

  async execute(query: string | sql.Statement | sql.Statement[]) {
    let conn = this.connection ?? this._handler;
    return conn.run(query);
  }

  async stream(query: string | sql.Statement | sql.Statement[]) {
    let conn = this.connection ?? this._handler;
    return await conn.stream(query);
  }

  flush(): void {}

  async initTransaction(): Promise<this> {
    // Create Clone
    let res = cloneDeep(this);

    let keys = Reflect.ownKeys(res);
    keys.forEach(key => {
      let prop = Reflect.get(res, key);
      if (prop instanceof TableSet) {
        prop.context = res;
      }
    });

    let nativeConn = await this._handler.getConnection();
    res.connection = new bean.Connection(res._handler, nativeConn);
    await res.connection.initTransaction();
    return res;
  }

  async commit() {
    if (!this.connection) throw new TypeError('Transaction Not Started');
    await this.connection.commit();
    await this.connection.close();
  }

  async rollback() {
    if (!this.connection) throw new TypeError('Transaction Not Started');
    await this.connection.rollback();
    await this.connection.close();
  }

  end() {
    return this._handler.end();
  }
}
