//#error: context.done is deprecated, use async and return
exports.handler = async event => {
  return event.arguments.msg;
};
