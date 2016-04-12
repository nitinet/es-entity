interface IContextType<T extends Context> {
    new (): T;
}

class Context {
    mappingPath: string;
    config: any;
    constructor() {
    }

    setConfig(config: any): void {
        this.config = config;
    }

}

export default Context;
export {IContextType};
