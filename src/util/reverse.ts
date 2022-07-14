import * as sql from '../sql/index.js';

function reverse<T extends Object>(res: T, ...srcs: any[]) {
	let allowKeys = Object.keys(res);
	srcs.forEach(src => {
		Object.keys(src).filter((key) => {
			return allowKeys.includes(key)
				&& src[key] instanceof sql.Field
				&& res[key] != src[key].get();
		}).forEach((key: string) => {
			res[key] = src[key].get();
		});
	});
	return res;
}

export default reverse;
