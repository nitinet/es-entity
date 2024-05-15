import { COLUMN_KEY, TABLE_COLUMN_KEYS } from './Constants.js';

function Column(name?: string) {
  return function (target: any, property: string) {
    let val = name ?? property;

    let columnVals: string[] | null = Reflect.getMetadata(TABLE_COLUMN_KEYS, target);
    if (!columnVals) columnVals = new Array();
    columnVals.push(property);
    Reflect.defineMetadata(TABLE_COLUMN_KEYS, columnVals, target);

    Reflect.defineMetadata(COLUMN_KEY, val, target, property);
  };
}

export default Column;
