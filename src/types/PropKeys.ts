type PropKeys<T> = Exclude<keyof T, "addChangeProp" | "clearChangeProps" | "getChangeProps">

export default PropKeys;
