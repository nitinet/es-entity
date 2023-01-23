import ColumnType from './ColumnType.js';

export default class ColumnInfo {
	field: string = '';
	type: ColumnType | null = null;
	nullable: boolean = false;
	primaryKey: boolean = false;
	default: string = '';
	extra: string = '';
}
