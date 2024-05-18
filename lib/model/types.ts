import Expression from '../sql/Expression.js';

type IArrFieldFunc<T> = (source: T) => Expression[];

type IJoinFunc<A, B> = (sourceA: A, sourceB: B) => Expression;

type IWhereFunc<T> = (source: T, ...args: any[]) => Expression;

type IEntityType<T> = new (...args: any[]) => T;

type ColumnType = Boolean | Number | BigInt | String | Buffer | Date;

type KeyOf<T> = keyof T;

type OperandType<T, K extends keyof T> = T[K] | Expression;

export { ColumnType, IArrFieldFunc, IEntityType, IJoinFunc, IWhereFunc, KeyOf, OperandType };
