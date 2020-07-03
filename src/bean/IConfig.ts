import IConnectionConfig from './IConnectionConfig';

interface IConfig {
	dbConfig: IConnectionConfig;
	entityPath?: string;
	logger?: any;
}
export default IConfig;
