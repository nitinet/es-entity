export default interface IConnectionConfig {
	handler: string;
	driver: any;
	connectionLimit?: number;
	hostname: string;  // Default Mysql
	username: string;
	password: string;
	database: string;
}
