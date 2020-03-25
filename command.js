var commands = [];

function Command(name, method, permissions) {
    var message = false;
    var args = false;

    this.set = function(msg) {
        message = msg;
    }

    this.getCommands = () => {
        return commands;
    }

    this.getName = () => {
        return name;
    }

    this.getArguments = () => {
        if (!args) return false;
        else {
            return args;
        }
    }

    /**
     * @param {Object[]} objArr - A list of the possible command arguments of a command.
     * @param {String} objArr[].name - The name of the argument.
     * @param {Boolean} [objArr[].optional] - Whether or not the argument is optional. Default is false.
     */
    this.attachArguments = (objArr) => {
        args = objArr;

        if (args.length == 0) args = false;
    }

    function CatchPromise(err) {
        this.catch = function(errorMethod) {
            if (err) errorMethod(err);
        }
    }

    this.execute = function(args) {
        var error = false;
        if (!message) {
            error = "No message was detected.";
        }
        else {

            if (!permissions) {
                method(message, args);
            }
            else {
                var member = message.member;
                var hasPermissions = true;
                permissions.forEach((item) => {
                    item = item.toUpperCase();
                    if (!member.hasPermission(item)) {
                        hasPermissions = false;
                    }
                });

                if (hasPermissions) {
                    method(message, args);
                }
                else {
                    error = "Sorry, you do not have the permissions to execute that command."
                }
            }

        }

        return new CatchPromise(error);
    }

    if (name && method) commands.push({name: name, cmd: this});

}

module.exports = Command;