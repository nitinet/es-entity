var Join;
(function (Join) {
    Join[Join["InnerJoin"] = 1] = "InnerJoin";
    Join[Join["LeftJoin"] = 2] = "LeftJoin";
    Join[Join["RightJoin"] = 3] = "RightJoin";
    Join[Join["OuterJoin"] = 4] = "OuterJoin";
})(Join || (Join = {}));
export default Join;
