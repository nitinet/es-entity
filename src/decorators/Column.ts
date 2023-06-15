import { COLUMN_KEY } from './Constants.js';

function Column(name: string) {
	return function (target: any, property: string) {
		let val = name ?? property;
		return Reflect.defineMetadata(COLUMN_KEY, val, target, property);
	}
}

export default Column;
