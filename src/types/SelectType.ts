
type SelectType<T> = {
	[Property in keyof T]?: any;
};

export default SelectType;

