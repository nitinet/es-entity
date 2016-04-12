interface IEntityType<T extends Entity> {
    new (): T;
}

class Entity {
    constructor() {

    }
}

export default Entity;
export {IEntityType};