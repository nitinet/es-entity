import * as types from './types';
import * as sql from './sql';
import * as moment from 'moment';

interface IOption {
	ignoreKeys?: (string | number | symbol)[],
	allowKeys?: (string | number | symbol)[]
}

function convert<T extends Object>(res: T, option?: IOption | any, ...srcs: any[]) {
	if (srcs == null || srcs.length == 0) {
		srcs = [option];
		option = null;
	}

	option = option || {};
	option.ignoreKeys = option.ignoreKeys || [];

	srcs.forEach(src => {
		let allowKeys = option.allowKeys ?? Reflect.ownKeys(src);
		Reflect.ownKeys(src).filter((key) => {
			return allowKeys.includes(key)
				&& !option.ignoreKeys.includes(key)
				&& src[key] != null
				&& res[key] instanceof sql.Field
				&& res[key].get() != src[key];
		}).forEach((key: string) => {
			if (res[key] instanceof types.Date) {
				let d = moment(src[key]);
				res[key].set(d.toDate());
			} else {
				res[key].set(src[key]);
			}
		});
	});
	return res;
}

function reverse<T extends Object>(res: T, option?: IOption | any, ...srcs: any[]) {
	if (srcs == null || srcs.length == 0) {
		srcs = [option];
		option = null;
	}

	option = option || {};
	option.ignoreKeys = option.ignoreKeys || [];

	srcs.forEach(src => {
		let allowKeys = option.allowKeys ?? Reflect.ownKeys(src);
		Reflect.ownKeys(src).filter((key) => {
			return allowKeys.includes(key)
				&& !option.ignoreKeys.includes(key)
				&& src[key] instanceof sql.Field
				&& res[key] != src[key].get();
		}).forEach((key: string) => {
			res[key] = src[key].get();
		});
	});
	return res;
}

export { convert };
export { reverse };
