import Handler from './Handler';

export default class Connection {
	private handler: Handler = null;
	private conn: any = null;

	constructor(handler: Handler, conn?) {
		this.handler = handler;
		this.conn = conn;
	}

	get Handler() {
		return this.handler;
	}

	get Conn() {
		return this.conn;
	}

	set Conn(conn) {
		this.conn = conn;
	}

	async open() {
		this.conn = await this.handler.openConnetion(this.conn);
	}

	async initTransaction() {
		await this.handler.initTransaction(this.conn);
	}

	async commit() {
		await this.handler.commit(this.conn);
	}

	async rollback() {
		await this.handler.rollback(this.conn);
	}

	async close() {
		await this.handler.close(this.conn);
	}
}