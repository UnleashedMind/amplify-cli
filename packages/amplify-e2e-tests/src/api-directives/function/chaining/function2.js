//#extra
exports.handler = async (event) => {
    return event.prev.result + '|processed by audit function';
};