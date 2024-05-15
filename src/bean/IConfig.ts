import IConnectionConfig from './IConnectionConfig.js';

interface IConfig {
  dbConfig: IConnectionConfig;
  logger?: any;
}
export default IConfig;
