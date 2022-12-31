class Entity {
    changedProps = new Set();
    addChangeProp(propKey) {
        this.changedProps.add(propKey);
    }
    clearChangeProps() {
        this.changedProps.clear();
    }
    getChangeProps() {
        return Array.from(this.changedProps);
    }
}
export default Entity;
