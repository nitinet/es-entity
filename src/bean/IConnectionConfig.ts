import HandlerType from './HandlerType';

interface IConnectionConfig {
	handler: HandlerType;
	driver: any;
	connectionLimit?: number;
	hostname: string;
	username: string;
	password: string;
	database: string;
}
export default IConnectionConfig;
