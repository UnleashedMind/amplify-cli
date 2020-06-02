import path from 'path';
import uuid from 'uuid';
import fs from 'fs-extra';
import { amplifyPushWithoutCodeGen, addSimpleFunction, addApiWithAPIKeyAuthType } from './workflows';

import { configureAmplify, getApiKey, getConfiguredAppsyncClientAPIKeyAuth } from './authHelper';

import { updateSchemaInTestProject, testQueries } from './common';

//The following runTest method runs the common test pattern for schemas in the @function section of the document.
//It carries out the following steps in sequence:
//Add the GraphQL API with "Amazon Cognito User Pool" as the default authorization type.
//Update the auth to create the "admin" Cognito User Pool user group
//Run `amplify push` to create the GraphQL API and the auth resources.
//Create "user1" in the User Pool and Add "user1" to the "admin" group.
//Configure Amplify of the Amplify JS library, its Auth module will be used to sign in user, and its API module will be used for mutations and queries
//Sign in "user1" with Ampify js library's Auth module
//Send the mutations, and if the corresponding mutation responses are present in the directory,
//the actual received mutation responses will be checked against the responses in the document.
//Send the queries, and if the corresponding query responses are present in the directory,
//the actual received query responses will be checked against the responses in the document.

export async function runFunctionTest(projectDir: string, testModule: any) {
  const functionName = await addFunction(projectDir, testModule, 'func');
  await addApiWithAPIKeyAuthType(projectDir);
  updateSchemaInTestProject(projectDir, testModule.schema);
  updateFunctionNameInSchema(projectDir, '<function-name>', functionName);
  await amplifyPushWithoutCodeGen(projectDir);

  const awsconfig = configureAmplify(projectDir);
  const apiKey = getApiKey(projectDir);
  const appSyncClient = getConfiguredAppsyncClientAPIKeyAuth(awsconfig.aws_appsync_graphqlEndpoint, awsconfig.aws_appsync_region, apiKey);

  await testQueries(testModule, appSyncClient);
}

export async function addFunction(projectDir: string, testModule: any, funcName: string): Promise<string> {
  const functionName = randomizedFunctionName(funcName);
  await addSimpleFunction(projectDir, functionName);

  const amplifyBackendDirPath = path.join(projectDir, 'amplify', 'backend');
  const amplifyFunctionIndexFilePath = path.join(amplifyBackendDirPath, 'function', functionName, 'src', 'index.js');

  fs.writeFileSync(amplifyFunctionIndexFilePath, testModule[funcName]);

  return functionName;
}

export function randomizedFunctionName(functionName: string) {
  functionName = functionName.toLowerCase().replace(/[^0-9a-zA-Z]/gi, '');
  const [shortId] = uuid().split('-');
  return `${functionName}${shortId}`;
}

export function updateFunctionNameInSchema(projectDir: string, functionNamePlaceHolder: string, functionName: string) {
  const backendApiDirPath = path.join(projectDir, 'amplify', 'backend', 'api');
  const apiResDirName = fs.readdirSync(backendApiDirPath)[0];
  const amplifySchemaFilePath = path.join(backendApiDirPath, apiResDirName, 'schema.graphql');

  let amplifySchemaFileContents = fs.readFileSync(amplifySchemaFilePath).toString();
  const placeHolderRegex = new RegExp(functionNamePlaceHolder, 'g');
  amplifySchemaFileContents = amplifySchemaFileContents.replace(placeHolderRegex, functionName);
  fs.writeFileSync(amplifySchemaFilePath, amplifySchemaFileContents);
}
