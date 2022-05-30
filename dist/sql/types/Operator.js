var Operator;
(function (Operator) {
    Operator[Operator["Equal"] = 1] = "Equal";
    Operator[Operator["NotEqual"] = 2] = "NotEqual";
    Operator[Operator["LessThan"] = 3] = "LessThan";
    Operator[Operator["LessThanEqual"] = 4] = "LessThanEqual";
    Operator[Operator["GreaterThan"] = 5] = "GreaterThan";
    Operator[Operator["GreaterThanEqual"] = 6] = "GreaterThanEqual";
    Operator[Operator["And"] = 7] = "And";
    Operator[Operator["Or"] = 8] = "Or";
    Operator[Operator["Not"] = 9] = "Not";
    Operator[Operator["Plus"] = 10] = "Plus";
    Operator[Operator["Minus"] = 11] = "Minus";
    Operator[Operator["Multiply"] = 12] = "Multiply";
    Operator[Operator["Devide"] = 13] = "Devide";
    Operator[Operator["Between"] = 14] = "Between";
    Operator[Operator["Exists"] = 15] = "Exists";
    Operator[Operator["In"] = 16] = "In";
    Operator[Operator["Like"] = 17] = "Like";
    Operator[Operator["IsNull"] = 18] = "IsNull";
    Operator[Operator["IsNotNull"] = 19] = "IsNotNull";
    Operator[Operator["Asc"] = 20] = "Asc";
    Operator[Operator["Desc"] = 21] = "Desc";
    Operator[Operator["Limit"] = 22] = "Limit";
    Operator[Operator["Count"] = 23] = "Count";
    Operator[Operator["Sum"] = 24] = "Sum";
    Operator[Operator["Min"] = 25] = "Min";
    Operator[Operator["Max"] = 26] = "Max";
    Operator[Operator["Avg"] = 27] = "Avg";
})(Operator || (Operator = {}));
export default Operator;
