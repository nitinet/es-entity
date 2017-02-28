export class FieldMapping {
	name: string = null;
	type: string = null;

	constructor(data: any) {
		Object.assign(this, data);
	}
}

export class EntityMapping {
	name: string = "";
	entityName: string = "";
	primaryKey: string = "";
	primaryKeyField: FieldMapping = null;
	fields: Map<string, FieldMapping> = new Map<string, FieldMapping>();

	constructor(data?: any) {
		if (data) {
			this.name = data.name;
			this.entityName = data.entityName;
			this.primaryKey = data.primaryKey;
			Reflect.ownKeys(data.fields).forEach((key) => {
				let val = data.fields[key];
				this.fields.set(<string>key, new FieldMapping(val));
			});
			this.primaryKeyField = this.fields.get(this.primaryKey);
		}
	}

}
