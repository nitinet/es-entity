import * as sql from '../sql/index.js';
import Connection from '../Connection.js';
import Context from '../Context.js';

import * as bean from '../bean/index.js';

export default abstract class Handler {
	context: Context = null;
	abstract handlerName: string;
	abstract driver: any;
	config: bean.IConnectionConfig;

	abstract init(): Promise<void>;

	async getTableInfo(tableName: string): Promise<Array<bean.ColumnInfo>> { return null; }
	async run(query: string | sql.INode, args?: Array<any>, connetction?: Connection): Promise<bean.ResultSet> { return null; }

	// Connetion manage functions
	abstract getConnection(): Promise<Connection>;
	abstract initTransaction(conn: any): Promise<void>;
	abstract commit(conn: any): Promise<void>;
	abstract rollback(conn: any): Promise<void>;
	abstract close(conn: any): Promise<void>;
	abstract end(): Promise<void>;

	convertPlaceHolder(query: string) {
		return query;
	}

	prepareQuery(queryStmt: string | sql.INode, args?: Array<any>) {
		let query: string = null;
		if (typeof queryStmt === 'string') {
			query = queryStmt;
		} else if (queryStmt instanceof sql.Statement) {
			query = queryStmt.eval(this);
			args = queryStmt.args;
		}
		return {
			query, args
		}
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
		return values.filter(x => x).map(val => {
			return `(${val})`;
		}).join(' and ');
	}

	or(values: string[]): string {
		return values.filter(x => x).map(val => {
			return `(${val})`;
		}).join(' or ');
	}

	not(val0: string): string {
		return ` not ${val0}`;
	}

	// Inclusion Funtions
	in(values: string[]): string {
		let lhs = values[0];
		let rhs = values.slice(1).join(', ');
		return `${lhs} in (${rhs})`;
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
	limit(size: string, index?: string): string {
		let indexStr = index ? `${index}, ` : '';
		return ` limit ${indexStr}${size}`;
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