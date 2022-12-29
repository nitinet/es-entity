interface IUpdateFunc<T> {
	(source: T): T;
}

export default IUpdateFunc;
