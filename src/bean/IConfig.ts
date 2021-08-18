import IConnectionConfig from './IConnectionConfig.js';

interface IConfig {
	dbConfig: IConnectionConfig;
	entityPath?: string;
	logger?: any;
}
export default IConfig;
