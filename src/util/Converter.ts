import * as sql from '../sql/index.js';
import * as types from '../types/index.js';

interface IOption {
	ignoreKeys?: (string | number | symbol)[],
	allowKeys?: (string | number | symbol)[],
	typeFuncs?: Map<types.IEntityType<any>, (src: any) => any>,
}

class Converter {

	option: IOption = null;

	constructor(option?: IOption) {
		this.option = option || {};
		this.option.ignoreKeys = option.ignoreKeys || [];
	}

	convert<T extends Object>(res: T, ...srcs: any[]) {
		let allowKeys = this.option.allowKeys || Object.keys(res);
		allowKeys = allowKeys.filter(key => {
			return !this.option.ignoreKeys.includes(key);
		});

		srcs.forEach(src => {
			Object.keys(src).filter((key) => {
				return allowKeys.includes(key)
					&& src[key] != null
					&& res[key] instanceof sql.Field
					&& res[key].get() != src[key];
			}).forEach((key: string) => {
				let typeFunc = this.option.typeFuncs != null ? this.option.typeFuncs.get(res[key].constructor) : null;
				if (typeFunc && typeof typeFunc == 'function') {
					res[key].set(typeFunc(src[key]));
				} else {
					res[key].set(src[key]);
				}
			});
		});
		return res;
	}

	reverse<T extends Object>(res: T, ...srcs: any[]) {
		let allowKeys = this.option.allowKeys || Object.keys(res);
		allowKeys = allowKeys.filter(key => {
			return !this.option.ignoreKeys.includes(key);
		});

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

}

export default Converter;
