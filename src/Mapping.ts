export class FieldMapping {
	fieldName: string = null;
	colName: string = null;
	type: string = null;
	primaryKey: boolean = false;

	constructor(data: any) {
		Object.assign(this, data);
	}
}

export class EntityMapping {
	name: string = '';
	entityName: string = '';
	fields = new Array<FieldMapping>();
	foreignRels = new Array<string>();

	constructor(data?: any) {
		if (data) {
			this.name = data.name;
			this.entityName = data.entityName;
			data.fields.forEach((val: any) => {
				this.fields.push(new FieldMapping(val));
			});
		}
	}

}
