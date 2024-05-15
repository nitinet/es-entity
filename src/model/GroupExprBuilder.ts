import BaseExprBuilder from './BaseExprBuilder.js';
import { KeyOf } from './types.js';

class GroupExprBuilder<T extends Object> extends BaseExprBuilder<T> {
  expr(propName: KeyOf<T>) {
    return this._expr(propName);
  }
}

export default GroupExprBuilder;
