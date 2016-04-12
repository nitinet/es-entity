import Context, {IContextType} from "./Context";

class Loader {
    constructor() {
    }

    static load(contextType: IContextType<Context>, mappingPath: string): Context {
        let context: Context = new contextType();
        context.mappingPath = mappingPath;
        return context;
    }
}

export default Loader;