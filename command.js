function Command(method, permissions) {
    var message = false;

    this.set = function(msg) {
        message = msg;
    }

    function CatchPromise(err) {
        this.catch = function(errorMethod) {
            if (err) errorMethod(err);
        }
    }

    this.execute = function(command, args) {
        var error = false;
        if (!message) {
            error = "No message was detected.";
        }
        else {

            if (!permissions) {
                method(command, args);
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
                    method(command, args);
                }
                else {
                    error = "Sorry, you do not have the permissions to execute that command."
                }
            }

        }

        return new CatchPromise(error);
    }

}

module.exports = Command;