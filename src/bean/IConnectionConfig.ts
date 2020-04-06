import HandlerType from './HandlerType';

interface IConnectionConfig {
	handler: HandlerType;
	driver?: any;
	connectionLimit?: number;
	host: string;
	port: number;
	username: string;
	password: string;
	database: string;
}
export default IConnectionConfig;
