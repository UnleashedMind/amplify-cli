//#extra
exports.handler = async (event) => {
    return event.arguments.msg + '|processed by worker-function';
};