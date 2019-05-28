import * as types from './types';
import * as sql from './sql';

export function getCriteria() {
	return new sql.Expression();
}
