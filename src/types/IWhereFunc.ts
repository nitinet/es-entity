import Expression from '../sql/Expression.js';
import OperatorEntity from '../model/OperatorEntity.js';
import Entity from '../model/Entity.js';

interface IWhereFunc<T extends OperatorEntity<Entity>> {
	(source: T, ...args: any[]): Expression;
}

export default IWhereFunc;
