import * as types from './types';
import * as sql from './sql';
import * as moment from 'moment';

function convert<T extends Object>(res: T, ignoreKeys: (string | number | symbol)[], ...srcs: any[]) {
	ignoreKeys ||= [];

	srcs.forEach(src => {
		Reflect.ownKeys(src).filter((key) => {
			return !ignoreKeys.includes(key)
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

function reverse<T extends Object>(res: T, ignoreKeys: (string | number | symbol)[], ...srcs: any[]) {
	ignoreKeys ||= [];

	srcs.forEach(src => {
		Reflect.ownKeys(src).filter((key) => {
			return !ignoreKeys.includes(key)
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
