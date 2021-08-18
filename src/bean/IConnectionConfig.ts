import HandlerType from './HandlerType.js';

interface IConnectionConfig {
	handler: HandlerType | string;
	driver?: any;
	connectionLimit?: number;
	host: string;
	port: number;
	username: string;
	password: string;
	database: string;
}
export default IConnectionConfig;
