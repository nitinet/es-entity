import HandlerType from './HandlerType.js';

interface IConnectionConfig {
  handler: HandlerType | string;
  connectionLimit?: number;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}
export default IConnectionConfig;
