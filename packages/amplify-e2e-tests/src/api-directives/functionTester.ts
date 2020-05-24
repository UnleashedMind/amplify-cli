import path from 'path';
import uuid from 'uuid';
import fs from 'fs-extra';
import _ from 'lodash';
import {
  addApiWithCognitoUserPoolAuthType, 
  updateAuthAddFirstUserGroup, 
  amplifyPushWithoutCodeGen,
  addSimpleFunction
} from './workflows';

import {
  setupUser,
  getUserPoolId,
  configureAmplify,
  signInUser,
  getConfiguredAppsyncClientCognitoAuth,
} from './authHelper';

import {
    testCompiledSchema,
    testMutations,
    testQueries
} from './common';

const GROUPNAME = 'admin';
const USERNAME = 'user1';
const PASSWORD = 'user1Password'

//The following runTest method runs the common test pattern for schemas in the @function section of the document.
//It does not test subscriptions. Subscription tests are handled individually in the schema doc directory.
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

export async function runFunctionTest(projectDir: string, schemaDocDirPath: string) {
    const schemaFilePath = path.join(schemaDocDirPath, 'input.graphql');
    const functionName = await addFunction(projectDir, schemaDocDirPath, 'function.js');
    await addApiWithCognitoUserPoolAuthType(projectDir, schemaFilePath);
    updateFunctionNameInSchema(projectDir, '<function-name>', functionName);
    await updateAuthAddFirstUserGroup(projectDir, GROUPNAME);
    await amplifyPushWithoutCodeGen(projectDir);
  
    const userPoolId = getUserPoolId(projectDir);
    await setupUser(userPoolId, USERNAME, PASSWORD, GROUPNAME);
    const awsconfig = configureAmplify(projectDir);
    const user = await signInUser(USERNAME, PASSWORD);
    const appsyncClient = getConfiguredAppsyncClientCognitoAuth(
      awsconfig.aws_appsync_graphqlEndpoint,
      awsconfig.aws_appsync_region,
      user
    );

    await testQueries(schemaDocDirPath, appsyncClient);
}

export async function addFunction(projectDir: string, schemaDocDirPath: string, functionFileName: string): Promise<string>{
  const functionFilePath = path.join(schemaDocDirPath, functionFileName)
  const functionName = randomizedFunctionName(functionFileName.split('.')[0]);
  await addSimpleFunction(projectDir, functionName);

  const amplifyBackendDirPath = path.join(projectDir, 'amplify', 'backend');
  const amplifyFunctionIndexFilePath = path.join(amplifyBackendDirPath, 'function', functionName, 'src', 'index.js');

  fs.copySync(functionFilePath, amplifyFunctionIndexFilePath);

  return functionName;
}

export function randomizedFunctionName(functionName: string){
  functionName = functionName.toLowerCase().replace(/[^0-9a-zA-Z]/gi, '');
  const [shortId] = uuid().split('-');
  return `${functionName}${shortId}`;
}

export function updateFunctionNameInSchema(projectDir: string, functionNamePlaceHolder: string, functionName: string){
  const backendApiDirPath = path.join(projectDir, 'amplify', 'backend', 'api');
  const apiResDirName = fs.readdirSync(backendApiDirPath)[0];
  const amplifySchemaFilePath = path.join(backendApiDirPath, apiResDirName, 'schema.graphql');

  let amplifySchemaFileContents = fs.readFileSync(amplifySchemaFilePath).toString();
  const placeHolderRegex = new RegExp(functionNamePlaceHolder, 'g');
  amplifySchemaFileContents = amplifySchemaFileContents.replace(placeHolderRegex, functionName);
  fs.writeFileSync(amplifySchemaFilePath, amplifySchemaFileContents);
}