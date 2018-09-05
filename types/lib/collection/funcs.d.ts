import { SqlExpression } from '../sql';
interface IWhereFunc<T> {
    (source: T, ...args: any[]): SqlExpression;
}
interface IArrFieldFunc<T> {
    (source: T): SqlExpression | SqlExpression[];
}
interface IForeignFunc<T> {
    (source: T, parent: any): SqlExpression;
}
export { IWhereFunc };
export { IArrFieldFunc };
export { IForeignFunc };
