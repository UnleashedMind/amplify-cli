//#extra
//create the lambda function in region other than the amplify project region
exports.handler = async event => {
  return event.arguments.msg;
};
