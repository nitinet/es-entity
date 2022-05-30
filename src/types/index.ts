import IEntityType from './IEntityType.js';
import BooleanType from './BooleanType.js';
import DateType from './DateType.js';
import BinaryType from './BinaryType.js';
import ObjectType from './ObjectType.js';
import NumberType from './NumberType.js';
import BigIntType from './BigIntType.js';
import StringType from './StringType.js';
import LinkObjectType from './LinkObjectType.js';
import LinkArrayType from './LinkArrayType.js';

export default {
	Boolean: BooleanType,
	Date: DateType,
	Binary: BinaryType,
	Json: ObjectType,
	Number: NumberType,
	BigInt: BigIntType,
	String: StringType,
	LinkObject: LinkObjectType,
	LinkArray: LinkArrayType
};

export {
	IEntityType,
	BooleanType as Boolean,
	DateType as Date,
	BinaryType as Binary,
	ObjectType as Json,
	NumberType as Number,
	BigIntType as BigInt,
	StringType as String,
	LinkObjectType as LinkObject,
	LinkArrayType as LinkArray
};
