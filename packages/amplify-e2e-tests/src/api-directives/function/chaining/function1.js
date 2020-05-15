exports.handler = function (event, context) {
    context.done(null, event.arguments.msg);
};