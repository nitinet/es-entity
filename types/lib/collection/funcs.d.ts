import { Expression } from '../sql';
interface IWhereFunc<T> {
    (source: T, ...args: any[]): Expression;
}
interface IArrFieldFunc<T> {
    (source: T): Expression | Expression[];
}
interface IForeignFunc<T> {
    (source: T, parent: any): Expression;
}
export { IWhereFunc };
export { IArrFieldFunc };
export { IForeignFunc };
