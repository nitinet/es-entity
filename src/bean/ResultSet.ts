export default class ResultSet {
	rowCount: number = 0;
	id: any = null;
	rows: Array<any> = new Array();
	error: string | null = null;
}