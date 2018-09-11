import HandlerType from './HandlerType';

interface IConnectionConfig {
	handler: string;
	driver?: any;
	connectionLimit?: number;
	hostname: string;
	username: string;
	password: string;
	database: string;
}
export default IConnectionConfig;
