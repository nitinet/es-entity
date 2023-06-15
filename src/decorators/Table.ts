import { TABLE_KEY } from './Constants.js';

function Table(name?: string) {
	return function (target: any) {
		let val = name ?? target.name;
		return Reflect.defineMetadata(TABLE_KEY, val, target);
	}
}

export default Table;
