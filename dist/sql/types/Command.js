var Command;
(function (Command) {
    Command[Command["SELECT"] = 0] = "SELECT";
    Command[Command["INSERT"] = 1] = "INSERT";
    Command[Command["UPDATE"] = 2] = "UPDATE";
    Command[Command["DELETE"] = 3] = "DELETE";
})(Command || (Command = {}));
export default Command;
