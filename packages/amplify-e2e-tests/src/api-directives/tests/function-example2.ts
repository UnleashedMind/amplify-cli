//special handling needed becasue we need to set up the function in a differnt region
import path from 'path';
import fs from 'fs-extra';
import {
  amplifyPushWithoutCodeGen,
  addSimpleFunctionWithAuthAccess,
  addApiWithCognitoUserPoolAuthTypeWhenAuthExists,
  updateAuthAddFirstUserGroup,
  addAuth,
} from '../workflows';

import { updateFunctionNameInSchema } from '../functionTester';

import {
  configureAmplify,
  getUserPoolId,
  getCognitoResourceName,
  setupUser,
  signInUser,
  getConfiguredAppsyncClientCognitoAuth,
} from '../authHelper';

import { updateSchemaInTestProject, testQueries } from '../common';

import { randomizedFunctionName } from '../functionTester';

const GROUPNAME = 'admin';
const USERNAME = 'user1';
const PASSWORD = 'user1Password';

export async function runTest(projectDir: string, testModule: any) {
  await addAuth(projectDir);
  const functionName = await addFunction(projectDir, __dirname, 'function.js');
  await addApiWithCognitoUserPoolAuthTypeWhenAuthExists(projectDir);
  updateSchemaInTestProject(projectDir, testModule.schema);

  updateFunctionNameInSchema(projectDir, '<function-name>', functionName);

  await updateAuthAddFirstUserGroup(projectDir, GROUPNAME);
  await amplifyPushWithoutCodeGen(projectDir);

  const userPoolId = getUserPoolId(projectDir);
  await setupUser(userPoolId, USERNAME, PASSWORD, GROUPNAME);
  const awsconfig = configureAmplify(projectDir);
  const user = await signInUser(USERNAME, PASSWORD);
  const appsyncClient = getConfiguredAppsyncClientCognitoAuth(awsconfig.aws_appsync_graphqlEndpoint, awsconfig.aws_appsync_region, user);

  await testQueries(__dirname, appsyncClient);
}

export async function addFunction(projectDir: string, schemaDocDirPath: string, functionFileName: string): Promise<string> {
  const functionFilePath = path.join(schemaDocDirPath, functionFileName);
  const functionName = randomizedFunctionName(functionFileName.split('.')[0]);
  await addSimpleFunctionWithAuthAccess(projectDir, functionName);

  const amplifyBackendDirPath = path.join(projectDir, 'amplify', 'backend');
  const amplifyFunctionIndexFilePath = path.join(amplifyBackendDirPath, 'function', functionName, 'src', 'index.js');

  fs.copySync(functionFilePath, amplifyFunctionIndexFilePath);

  const cognitoResourceNameUpperCase = getCognitoResourceName(projectDir).toUpperCase();
  const userPoolIDEnvVarName = `AUTH_${cognitoResourceNameUpperCase}_USERPOOLID`;

  let funcitonIndexFileContents = fs.readFileSync(amplifyFunctionIndexFilePath).toString();
  const placeHolderRegex = new RegExp('AUTH_MYRESOURCENAME_USERPOOLID', 'g');
  funcitonIndexFileContents = funcitonIndexFileContents.replace(placeHolderRegex, userPoolIDEnvVarName);
  fs.writeFileSync(amplifyFunctionIndexFilePath, funcitonIndexFileContents);

  return functionName;
}

//functions
export const func = `
/* Amplify Params - DO NOT EDIT
You can access the following resource attributes as environment variables from your Lambda function
var environment = process.env.ENV
var region = process.env.REGION
var authMyResourceNameUserPoolId = process.env.AUTH_MYRESOURCENAME_USERPOOLID

Amplify Params - DO NOT EDIT */

const { CognitoIdentityServiceProvider } = require('aws-sdk');
const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider();

/**
 * Get user pool information from environment variables.
 */
const COGNITO_USERPOOL_ID = process.env.AUTH_MYRESOURCENAME_USERPOOLID;
if (!COGNITO_USERPOOL_ID) {
  throw new Error("Function requires environment variable: 'COGNITO_USERPOOL_ID'");
}
const COGNITO_USERNAME_CLAIM_KEY = 'cognito:username';

/**
 * Using this as the entry point, you can use a single function to handle many resolvers.
 */
const resolvers = {
  Query: {
    echo: ctx => {
      return ctx.arguments.msg;
    },
    me: async ctx => {
      var params = {
        UserPoolId: COGNITO_USERPOOL_ID /* required */,
        Username: ctx.identity.claims[COGNITO_USERNAME_CLAIM_KEY] /* required */,
      };
      try {
        // Read more: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#adminGetUser-property
        return await cognitoIdentityServiceProvider.adminGetUser(params).promise();
      } catch (e) {
        throw new Error('NOT FOUND');
      }
    },
  },
};

// event
// {
//   "typeName": "Query", /* Filled dynamically based on @function usage location */
//   "fieldName": "me", /* Filled dynamically based on @function usage location */
//   "arguments": { /* GraphQL field arguments via $ctx.arguments */ },
//   "identity": { /* AppSync identity object via $ctx.identity */ },
//   "source": { /* The object returned by the parent resolver. E.G. if resolving field 'Post.comments', the source is the Post object. */ },
//   "request": { /* AppSync request object. Contains things like headers. */ },
//   "prev": { /* If using the built-in pipeline resolver support, this contains the object returned by the previous function. */ },
// }
exports.handler = async event => {
  const typeHandler = resolvers[event.typeName];
  if (typeHandler) {
    const resolver = typeHandler[event.fieldName];
    if (resolver) {
      return await resolver(event);
    }
  }
  throw new Error('Resolver not found.');
};
`
//schema
const env = "${env}";
export const schema = `
#change: replaced "ResolverFunction" with the "<function-name>" placeholder, the test will replace it with the actual function name
type Query {
  me: User @function(name: "<function-name>-${env}")
  echo(msg: String): String @function(name: "<function-name>-${env}")
}
# These types derived from https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#adminGetUser-property
type User {
  Username: String!
  UserAttributes: [Value]
  UserCreateDate: String
  UserLastModifiedDate: String
  Enabled: Boolean
  UserStatus: UserStatus
  MFAOptions: [MFAOption]
  PreferredMfaSetting: String
  UserMFASettingList: String
}
type Value {
  Name: String!
  Value: String
}
type MFAOption {
  DeliveryMedium: String
  AttributeName: String
}
enum UserStatus {
  UNCONFIRMED
  CONFIRMED
  ARCHIVED
  COMPROMISED
  UNKNOWN
  RESET_REQUIRED
  FORCE_CHANGE_PASSWORD
}
`

//queries
export const query = `
query {
  me {
    Username
    UserStatus
    UserCreateDate
    UserAttributes {
      Name
      Value
    }
    MFAOptions {
      AttributeName
      DeliveryMedium
    }
    Enabled
    PreferredMfaSetting
    UserMFASettingList
    UserLastModifiedDate
  }
}
`



