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
				let resVal = Reflect.get(res, key);
				return allowKeys.includes(key)
					&& src[key] != null
					&& resVal instanceof sql.Field
					&& resVal.get() != src[key];
			}).forEach((key: string) => {
				let resVal = (<sql.Field<any>>Reflect.get(res, key));
				let typeFunc = this.option.typeFuncs != null ? this.option.typeFuncs.get(<any>resVal.constructor) : null;
				if (typeFunc && typeof typeFunc == 'function') {
					resVal.set(typeFunc(src[key]));
				} else {
					resVal.set(src[key]);
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
				let resVal = Reflect.get(res, key);
				return allowKeys.includes(key)
					&& src[key] instanceof sql.Field
					&& resVal != src[key].get();
			}).forEach((key: string) => {
				Reflect.set(res, key, src[key].get());
			});
		});
		return res;
	}

}

export default Converter;
