import * as sql from './sql';
import Connection from './Connection';
import Context from './Context';

import * as bean from './bean/index';

export default abstract class Handler {
	context: Context = null;
	abstract handlerName: string;
	abstract driver;
	config: bean.IConnectionConfig;

	abstract async init(): Promise<void>;

	async getTableInfo(tableName: string): Promise<Array<bean.ColumnInfo>> { return null; }
	async run(query: string | sql.INode, args?: Array<any>, connetction?: Connection): Promise<bean.ResultSet> { return null; }

	// Connetion manage functions
	abstract async getConnection(): Promise<Connection>;
	abstract async openConnetion(conn): Promise<any>;
	abstract async initTransaction(conn): Promise<void>;
	abstract async commit(conn): Promise<void>;
	abstract async rollback(conn): Promise<void>;
	abstract async close(conn): Promise<void>;
	abstract async end(): Promise<void>;

	convertPlaceHolder(query: string) {
		return query;
	}

	// Comparison Operators
	eq(val0: string, val1: string): string {
		return `${val0} = ${val1}`;
	}
	neq(val0: string, val1: string): string {
		return `${val0} != ${val1}`;
	}
	lt(val0: string, val1: string): string {
		return `${val0} < ${val1}`;
	}
	gt(val0: string, val1: string): string {
		return `${val0} > ${val1}`;
	}
	lteq(val0: string, val1: string): string {
		return `${val0} <= ${val1}`;
	}
	gteq(val0: string, val1: string): string {
		return `${val0} >= ${val1}`;
	}

	// Logical Operators
	and(values: string[]): string {
		let r = values.map(val => {
			return `(${val})`;
		}).join(' and ');
		return r;
	}
	or(values: string[]): string {
		let r = values.map(val => {
			return `(${val})`;
		}).join(' or ');
		return r;
	}
	not(val0: string): string {
		return ` not ${val0}`;
	}

	// Inclusion Funtions
	in(val0: string, val1: string): string {
		return `${val0} in (${val1})`;
	}
	between(values: string[]): string {
		return `${values[0]} between ${values[1]} and ${values[2]}`;
	}
	like(val0: string, val1: string): string {
		return `${val0} like ${val1}`;
	}
	isNull(val0: string): string {
		return `${val0} is null`;
	}
	isNotNull(val0: string): string {
		return `${val0} is not null`;
	}
	exists(val0: string): string {
		return ` exists (${val0})`;
	}
	limit(val0: string, val1: string): string {
		return ` limit ${val0}${val1 ? `,${val1}` : ''}`;
	}

	// Arithmatic Operators
	plus(val0: string, val1: string): string {
		return `${val0} + ${val1}`;
	}
	minus(val0: string, val1: string): string {
		return `${val0} - ${val1}`;
	}
	multiply(val0: string, val1: string): string {
		return `${val0} * ${val1}`;
	}
	devide(val0: string, val1: string): string {
		return `${val0} / ${val1}`;
	}

	// Sorting Operators
	asc(val0: string): string {
		return `${val0} asc`;
	}
	desc(val0: string): string {
		return `${val0} desc`;
	}

	// Group Functions
	sum(val0: string): string {
		return `sum(${val0})`;
	}
	min(val0: string): string {
		return `min(${val0})`;
	}
	max(val0: string): string {
		return `max(${val0})`;
	}
	count(val0: string): string {
		return `count(${val0})`;
	}
	average(val0: string): string {
		return `avg(${val0})`;
	}

}
