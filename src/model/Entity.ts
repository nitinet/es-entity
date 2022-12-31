import { PropKeys } from './types.js';

class Entity {
	private changedProps: Set<string | symbol> = new Set();

	addChangeProp(propKey: PropKeys<this>) {
		this.changedProps.add(<string>propKey);
	}

	clearChangeProps() {
		this.changedProps.clear()
	}

	getChangeProps() {
		return Array.from(this.changedProps);
	}

}

export default Entity;
