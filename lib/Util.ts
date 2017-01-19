import * as Type from "./Type";

export class PropertyTransformer {
	fields: Array<string> = new Array<string>();

	assignObject(source: any, target?: any): any {
		if (!target) {
			target = {};
		}
		Reflect.ownKeys(source).forEach(key => {
			let value = source[key.toString()].get();
			target[key.toString()] = value;
		});
		return target;
	}

	assignEntity(target: any, ...sources: Array<any>) {
		sources.forEach(source => {
			let keys = Reflect.ownKeys(source);
			keys.forEach(key => {
				if (this.fields.indexOf(key.toString()) != -1 && Reflect.has(target, key)) {
					let value = Reflect.get(source, key);
					if (target[key] instanceof Type.Date) {
						target[key].set(new Date(value));
					} else {
						target[key].set(value);
					}
				}
			});
		});
		return target;
	}
}