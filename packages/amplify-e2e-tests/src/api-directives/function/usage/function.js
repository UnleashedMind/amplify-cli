//#error: context.done is deprecated, use async
exports.handler = async (event) => {
    return event.arguments.msg;
};