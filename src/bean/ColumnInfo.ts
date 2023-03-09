import ColumnType from './ColumnType.js';

export default class ColumnInfo {
	field!: string;
	type!: ColumnType;
	nullable: boolean = false;
	primaryKey: boolean = false;
	default: string | null = null;
	extra: string | null = null;
}
