import Entity, {IEntityType} from "./Entity";

class Queryable {
    entityType: IEntityType<Entity> = null;

    constructor(entityType: IEntityType<Entity>) {
        this.entityType = entityType;
    }

}

export default Queryable;