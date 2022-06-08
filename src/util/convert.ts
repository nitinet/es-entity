import * as sql from '../sql/index.js';
import * as types from '../types/index.js';

function convert<T extends Object>(res: T, ...srcs: any[]) {
	let allowKeys = Object.keys(res);
	srcs.forEach(src => {
		Object.keys(src).filter((key) => {
			return allowKeys.includes(key)
				&& src[key] != null
				&& res[key] instanceof sql.Field
				&& res[key].get() != src[key];
		}).forEach((key: string) => {
			if (res[key] instanceof types.Date) {
				let d: Date = null;
				if (src[key] instanceof Date) {
					d = src[key];
				}
				res[key].set(d);
			} else {
				res[key].set(src[key]);
			}
		});
	});
	return res;
}

export default convert;
