import Expression from '../sql/Expression.js';
import OperatorEntity from '../model/OperatorEntity.js';
import Entity from '../model/Entity.js';

interface IArrFieldFunc<T extends OperatorEntity<Entity>> {
	(source: T): Expression[];
}

export default IArrFieldFunc;
