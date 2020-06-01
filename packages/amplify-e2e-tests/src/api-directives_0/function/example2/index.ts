//special handling needed becasue we need to set up the function in a differnt region
import path from 'path';
import fs from 'fs-extra';
import {
  amplifyPushWithoutCodeGen,
  addSimpleFunctionWithAuthAccess,
  addApiWithCognitoUserPoolAuthTypeWhenAuthExists,
  updateAuthAddFirstUserGroup,
  addAuth,
} from '../../workflows';

import { updateFunctionNameInSchema } from '../../functionTester';

import {
  configureAmplify,
  getUserPoolId,
  getCognitoResourceName,
  setupUser,
  signInUser,
  getConfiguredAppsyncClientCognitoAuth,
} from '../../authHelper';

import { testQueries } from '../../common';

import { randomizedFunctionName } from '../../functionTester';

const GROUPNAME = 'admin';
const USERNAME = 'user1';
const PASSWORD = 'user1Password';

export async function runTest(projectDir: string) {
  const schemaFilePath = path.join(__dirname, 'input.graphql');
  await addAuth(projectDir);
  const functionName = await addFunction(projectDir, __dirname, 'function.js');
  await addApiWithCognitoUserPoolAuthTypeWhenAuthExists(projectDir, schemaFilePath);
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
